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

    const { slug, price, original_price } = await req.json();

    if (!slug || typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { error: 'Invalid slug or price' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from('books')
      .update({
        price,
        original_price: original_price || null
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
