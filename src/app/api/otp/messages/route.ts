import { NextResponse } from 'next/server';
import { hasOtpSession } from '@/lib/otpAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await hasOtpSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAdminClient();
  const [{ data, error }, status] = await Promise.all([
    supabase
    .from('wa_messages')
    .select('id, chat_name, sender, from_me, body, sent_at, received_at')
    .order('sent_at', { ascending: false })
    .limit(30),
    supabase.from('wa_sync_status').select('last_seen').eq('id', 1).maybeSingle()
  ]);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(
    { messages: data ?? [], lastSync: status.data?.last_seen ?? null, serverTime: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
