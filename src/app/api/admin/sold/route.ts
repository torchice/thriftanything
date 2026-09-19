import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookies, verifySession } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    // Check auth
    const sessionToken = await getSessionFromCookies();
    if (!sessionToken || !(await verifySession(sessionToken))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slug, sold } = await req.json();

    if (!slug || typeof sold !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing slug or sold' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from('books')
      .update({
        sold,
        sold_at: sold ? new Date().toISOString() : null
      })
      .eq('slug', slug);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    /*
      A misconfigured key throws before the request leaves the server. Surface
      that message: it names the variable and the bad character, never a value.
    */
    const message = error instanceof Error ? error.message : '';
    if (/SUPABASE_|NEXT_PUBLIC_SUPABASE_/.test(message)) {
      return NextResponse.json({ error: message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
