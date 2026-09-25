import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpPassword, setOtpSession } from '@/lib/otpAuth';

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: '' }));
  if (!password || !verifyOtpPassword(String(password))) {
    // Small fixed delay slows down password guessing.
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: 'Password salah' }, { status: 401 });
  }
  await setOtpSession();
  return NextResponse.json({ success: true });
}
