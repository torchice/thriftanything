import { NextResponse } from 'next/server';
import { clearOtpSession } from '@/lib/otpAuth';

export async function POST() {
  await clearOtpSession();
  return NextResponse.json({ success: true });
}
