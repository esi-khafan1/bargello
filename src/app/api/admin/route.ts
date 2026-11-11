import { NextRequest, NextResponse } from 'next/server';
import {
  createServerSupabase,
  isServerSupabaseKnownBlocked,
} from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, passcode } = body;

  if (isServerSupabaseKnownBlocked()) {
    return NextResponse.json({ sandboxDirect: true });
  }

  const supabase = createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ sandboxDirect: true });
  }

  try {
    if (action === 'verify') {
      const { data, error } = await supabase.rpc('verify_admin_passcode', {
        p_passcode: passcode,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ sandboxDirect: false, valid: Boolean(data) });
    }

    if (action === 'dashboard') {
      const { data, error } = await supabase.rpc('admin_get_dashboard', {
        p_passcode: passcode,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      return NextResponse.json({ sandboxDirect: false, dashboard: data });
    }

    if (action === 'upsert_product') {
      const { data, error } = await supabase.rpc('admin_upsert_product', {
        p_passcode: passcode,
        p_product: body.product,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ sandboxDirect: false, productId: data });
    }

    if (action === 'delete_product') {
      const { error } = await supabase.rpc('admin_delete_product', {
        p_passcode: passcode,
        p_product_id: body.product_id,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ sandboxDirect: false, ok: true });
    }

    if (action === 'update_order') {
      const { error } = await supabase.rpc('admin_update_order', {
        p_passcode: passcode,
        p_order_id: body.order_id,
        p_payment_status: body.payment_status,
        p_order_status: body.order_status,
        p_postal_tracking_code: body.postal_tracking_code ?? '',
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ sandboxDirect: false, ok: true });
    }

    if (action === 'update_settings') {
      const { error } = await supabase.rpc('admin_update_store_settings', {
        p_passcode: passcode,
        p_settings: body.settings,
        p_new_passcode: body.new_passcode ?? null,
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ sandboxDirect: false, ok: true });
    }

    return NextResponse.json({ error: 'عملیات نامعتبر' }, { status: 400 });
  } catch {
    return NextResponse.json({ sandboxDirect: true });
  }
}
