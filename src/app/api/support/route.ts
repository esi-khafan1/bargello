import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabase,
  isServerSupabaseKnownBlocked,
} from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (isServerSupabaseKnownBlocked()) {
    return NextResponse.json({ sandboxDirect: true });
  }

  const supabase = createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ sandboxDirect: true });
  }

  try {
    const { error } = await supabase.from('support_messages').insert({
      full_name: body.full_name,
      phone: body.phone,
      order_code: body.order_code || null,
      subject: body.subject,
      message: body.message,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ sandboxDirect: false, ok: true });
  } catch {
    return NextResponse.json({ sandboxDirect: true });
  }
}
