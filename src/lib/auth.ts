import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || '';

interface SessionPayload {
  exp: number;
  nonce: string;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function verifyPassword(password: string): Promise<boolean> {
  return constantTimeCompare(
    hashPassword(password),
    hashPassword(ADMIN_PASSWORD)
  );
}

export async function createSession(): Promise<string> {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload: SessionPayload = { exp, nonce };

  const message = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(message);
  const signature = hmac.digest('hex');

  return `${Buffer.from(message).toString('base64')}.${signature}`;
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    const [payload, signature] = token.split('.');
    const message = Buffer.from(payload, 'base64').toString();

    const hmac = crypto.createHmac('sha256', SESSION_SECRET);
    hmac.update(message);
    const expectedSignature = hmac.digest('hex');

    if (!constantTimeCompare(signature, expectedSignature)) {
      return false;
    }

    const data: SessionPayload = JSON.parse(message);
    return data.exp > Date.now();
  } catch {
    return false;
  }
}

export async function getSessionFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value || null;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}
