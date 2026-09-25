import { cookies } from 'next/headers';
import crypto from 'crypto';

/*
  Separate from the admin login on purpose: people who only need to read
  GolekTruk OTPs get OTP_PASSWORD, never ADMIN_PASSWORD (which can edit prices).
  Sessions are signed with ADMIN_SESSION_SECRET plus a scope tag, so an admin
  cookie can't be replayed as an OTP cookie or the other way round.
*/
const COOKIE = 'otp_session';
const MAX_AGE_S = 30 * 24 * 60 * 60; // 30 days

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET || '';
  if (!s) throw new Error('ADMIN_SESSION_SECRET is not set.');
  return s;
}

function sha(v: string): Buffer {
  return crypto.createHash('sha256').update(v).digest();
}

export function safeEqual(a: string, b: string): boolean {
  return crypto.timingSafeEqual(sha(a), sha(b));
}

export function verifyOtpPassword(password: string): boolean {
  const expected = process.env.OTP_PASSWORD || '';
  if (!expected) return false; // fail closed if not configured
  return safeEqual(password, expected);
}

function sign(message: string): string {
  return crypto.createHmac('sha256', secret()).update(`otp:${message}`).digest('hex');
}

export async function setOtpSession(): Promise<void> {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + MAX_AGE_S * 1000, n: crypto.randomBytes(8).toString('hex') })
  ).toString('base64url');
  const store = await cookies();
  store.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_S
  });
}

export async function hasOtpSession(): Promise<boolean> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE)?.value;
    if (!token) return false;
    const [payload, sig] = token.split('.');
    if (!payload || !sig || !safeEqual(sig, sign(payload))) return false;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof data.exp === 'number' && data.exp > Date.now();
  } catch {
    return false;
  }
}

export async function clearOtpSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
