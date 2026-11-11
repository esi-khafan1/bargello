import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabase,
  isServerSupabaseKnownBlocked,
} from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code') ?? '';
  const phone = searchParams.get('phone') ?? '';

  if (isServerSupabaseKnownBlocked()) {
    return NextResponse.json({ sandboxDirect: true });
  }

  const supabase = createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ sandboxDirect: true });
  }

  try {
    const { data, error } = await supabase.rpc('track_store_order', {
      p_order_code: code,
      p_phone: phone,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ sandboxDirect: false, order: data });
  } catch {
    return NextResponse.json({ sandboxDirect: true });
  }
}

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
    const { data, error } = await supabase.rpc('create_store_order', {
      p_customer_name: body.customer_name,
      p_customer_phone: body.customer_phone,
      p_province: body.province,
      p_city: body.city,
      p_address: body.address,
      p_postal_code: body.postal_code ?? '',
      p_notes: body.notes ?? '',
      p_payment_method: body.payment_method,
      p_receipt_reference: body.receipt_reference ?? '',
      p_items: body.items,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ sandboxDirect: false, receipt: data });
  } catch {
    return NextResponse.json({ sandboxDirect: true });
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  if (isServerSupabaseKnownBlocked()) {
    return NextResponse.json({ sandboxDirect: true });
  }

  const supabase = createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ sandboxDirect: true });
  }

  try {
    const { data, error } = await supabase.rpc('submit_order_receipt', {
      p_order_code: body.order_code,
      p_phone: body.phone,
      p_receipt_reference: body.receipt_reference,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ sandboxDirect: false, ok: Boolean(data) });
  } catch {
    return NextResponse.json({ sandboxDirect: true });
  }
}
