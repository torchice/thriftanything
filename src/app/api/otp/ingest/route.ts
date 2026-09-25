import { NextRequest, NextResponse } from 'next/server';
import { safeEqual } from '@/lib/otpAuth';
import { createAdminClient } from '@/lib/supabase/admin';

/*
  Called by the sync script on the Mac. It holds OTP_INGEST_TOKEN only, never
  the Supabase service key, so a leaked Mac config can add rows but not read them.
*/
interface IncomingMessage {
  id: string;
  chat_name: string;
  sender?: string | null;
  from_me?: boolean;
  body?: string | null;
  sent_at: string;
}

export async function POST(req: NextRequest) {
  const expected = process.env.OTP_INGEST_TOKEN || '';
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!expected || !token || !safeEqual(token, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  // Heartbeat: every call (even with no new messages) proves the Mac is alive.
  await supabase.from('wa_sync_status').upsert({ id: 1, last_seen: new Date().toISOString() });

  const body = await req.json().catch(() => null);
  const list: IncomingMessage[] = Array.isArray(body?.messages) ? body.messages : [];
  if (list.length === 0) return NextResponse.json({ inserted: 0 });
  if (list.length > 500) {
    return NextResponse.json({ error: 'Max 500 messages per request' }, { status: 413 });
  }

  const rows = [];
  for (const m of list) {
    if (!m?.id || !m?.chat_name || !m?.sent_at || isNaN(Date.parse(m.sent_at))) {
      return NextResponse.json({ error: 'Each message needs id, chat_name, sent_at' }, { status: 400 });
    }
    rows.push({
      id: String(m.id).slice(0, 200),
      chat_name: String(m.chat_name).slice(0, 200),
      sender: m.sender ? String(m.sender).slice(0, 200) : null,
      from_me: Boolean(m.from_me),
      body: m.body ? String(m.body).slice(0, 4000) : null,
      sent_at: new Date(m.sent_at).toISOString()
    });
  }

  const { error } = await supabase
    .from('wa_messages')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inserted: rows.length });
}
