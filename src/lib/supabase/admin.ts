import { createClient } from '@supabase/supabase-js';

/*
  Supabase sends the key as an HTTP header, and header values must be Latin-1.
  A key copied while the dashboard still masked it carries bullet characters
  (U+2022), which fetch rejects with an opaque "Cannot convert argument to a
  ByteString" TypeError. Check here so the failure names the real cause.
*/
function readKey(name: string): string {
  const raw = process.env[name];
  if (!raw) {
    throw new Error(`${name} is not set in this environment.`);
  }

  const value = raw.trim();
  const badIndex = [...value].findIndex((ch) => ch.codePointAt(0)! > 255);
  if (badIndex !== -1) {
    const ch = value[badIndex];
    throw new Error(
      `${name} contains a non-ASCII character (U+${ch
        .codePointAt(0)!
        .toString(16)
        .toUpperCase()
        .padStart(4, '0')}) at position ${badIndex}. The key was probably copied while it was still masked. Reveal it in the Supabase dashboard, copy it again, and update the environment variable.`
    );
  }

  return value;
}

export function createAdminClient() {
  return createClient(
    readKey('NEXT_PUBLIC_SUPABASE_URL'),
    readKey('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false } }
  );
}
