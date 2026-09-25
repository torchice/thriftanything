'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Msg {
  id: string;
  chat_name: string;
  sender: string | null;
  from_me: boolean;
  body: string | null;
  sent_at: string;
}

const POLL_MS = 5000;
const STALE_SYNC_MS = 3 * 60 * 1000; // Mac hasn't checked in for 3 min -> warn
const FRESH_OTP_MS = 10 * 60 * 1000; // most OTPs expire within 5-10 min

// First 4-8 digit run (also "123 456" / "123-456"), skipping years and phone-like numbers.
function extractCode(text: string | null): string | null {
  if (!text) return null;
  const m = text.match(/(?<![\d+])(\d{3}[ -]\d{3}|\d{4,8})(?!\d)/);
  return m ? m[1].replace(/[ -]/g, '') : null;
}

function ago(iso: string, now: number): string {
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (s < 60) return `${s} detik lalu`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} jam lalu`;
  return `${Math.round(h / 24)} hari lalu`;
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function OtpContent() {
  const [state, setState] = useState<'loading' | 'login' | 'ready'>('loading');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState('');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/otp/messages', { cache: 'no-store' });
      if (res.status === 401) {
        setState('login');
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat');
      setMessages(data.messages);
      setLastSync(data.lastSync);
      setFetchError('');
      setState('ready');
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Gagal memuat');
    }
  }, []);

  useEffect(() => {
    load();
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [load]);

  useEffect(() => {
    if (state !== 'ready') return;
    timer.current = setInterval(load, POLL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [state, load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/otp/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      setPassword('');
      load();
    } else {
      setError('Password salah');
    }
  }

  async function logout() {
    await fetch('/api/otp/logout', { method: 'POST' });
    setMessages([]);
    setState('login');
  }

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard blocked (http or old browser): the code is still selectable */
    }
  }

  if (state === 'loading') return <p className="text-body">Memuat...</p>;

  if (state === 'login') {
    return (
      <form onSubmit={login} className="max-w-sm space-y-3">
        <label className="block text-sm text-body" htmlFor="otp-pw">Password</label>
        <input
          id="otp-pw"
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-rule bg-white px-3 py-2 rounded"
        />
        {error && <p className="text-clay text-sm">{error}</p>}
        <button type="submit" className="bg-forest text-paper px-4 py-2 rounded hover:bg-forest-deep">
          Masuk
        </button>
      </form>
    );
  }

  const latest = messages.find((m) => !m.from_me) ?? null;
  const latestCode = latest ? extractCode(latest.body) : null;
  const latestFresh = latest ? now - Date.parse(latest.sent_at) < FRESH_OTP_MS : false;
  const syncStale = !lastSync || now - Date.parse(lastSync) > STALE_SYNC_MS;

  return (
    <div className="space-y-6">
      <div className={`text-sm rounded px-3 py-2 ${syncStale ? 'bg-tint-clay text-clay' : 'bg-tint-green text-forest'}`}>
        {syncStale
          ? `Mac tidak sync ${lastSync ? 'sejak ' + ago(lastSync, now) : 'sama sekali'}. OTP baru tidak akan muncul sampai Mac nyala dan WhatsApp desktop terbuka.`
          : `Mac tersambung, terakhir sync ${ago(lastSync!, now)}.`}
      </div>
      {fetchError && <p className="text-clay text-sm">Gagal refresh: {fetchError}</p>}

      {latest ? (
        <section className={`border rounded p-5 ${latestFresh ? 'border-forest bg-white' : 'border-rule bg-tan'}`}>
          <div className="text-xs text-body mb-1">
            Terbaru · {fmt(latest.sent_at)} · {ago(latest.sent_at, now)}
            {!latestFresh && ' · kemungkinan sudah kedaluwarsa'}
          </div>
          {latestCode && (
            <button
              type="button"
              onClick={() => copy(latestCode)}
              className="font-display text-5xl tracking-widest my-2 select-all"
              title="Klik untuk copy"
            >
              {latestCode}
            </button>
          )}
          {latestCode && (
            <div className="text-xs text-body mb-2">{copied === latestCode ? 'Tersalin' : 'Klik kode untuk copy'}</div>
          )}
          <p className="text-body whitespace-pre-wrap break-words text-sm">{latest.body}</p>
        </section>
      ) : (
        <p className="text-body">Belum ada pesan.</p>
      )}

      {messages.length > 1 && (
        <section>
          <h2 className="font-display text-xl mb-3">Sebelumnya</h2>
          <ul className="divide-y divide-rule border-y border-rule">
            {messages.filter((m) => m !== latest).map((m) => {
              const code = extractCode(m.body);
              return (
                <li key={m.id} className="py-3">
                  <div className="text-xs text-body">
                    {fmt(m.sent_at)} · {m.from_me ? 'Saya' : m.sender || m.chat_name}
                    {code && <span className="ml-2 font-semibold text-ink">{code}</span>}
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <button type="button" onClick={logout} className="text-sm text-body underline">
        Keluar
      </button>
    </div>
  );
}
