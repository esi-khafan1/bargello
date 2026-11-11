import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const status = searchParams.get('Status');
  const authority = searchParams.get('Authority');
  const orderCode = searchParams.get('order_code') ?? '';
  const amount = Number(searchParams.get('amount') ?? '0');

  const merchantId = process.env.ZARINPAL_MERCHANT_ID;
  const isSandbox = process.env.ZARINPAL_SANDBOX === 'true';

  if (status !== 'OK' || !authority || !merchantId) {
    return NextResponse.redirect(
      `${origin}/track?code=${encodeURIComponent(orderCode)}&payment=cancelled`
    );
  }

  const baseHost = isSandbox
    ? 'https://sandbox.zarinpal.com'
    : 'https://payment.zarinpal.com';

  try {
    const verifyRes = await fetch(
      `${baseHost}/pg/v4/payment/verify.json`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId,
          amount: Math.round(amount),
          authority,
        }),
      }
    );

    const verifyJson = await verifyRes.json();
    const code = verifyJson?.data?.code;
    const refId = String(verifyJson?.data?.ref_id ?? '');

    if (code === 100 || code === 101) {
      const supabase = createServerSupabase();
      if (supabase && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            order_status: 'processing',
            receipt_reference: refId,
          })
          .eq('order_code', orderCode);
      }

      return NextResponse.redirect(
        `${origin}/track?code=${encodeURIComponent(orderCode)}&payment=paid&ref=${encodeURIComponent(refId)}`
      );
    }
  } catch {
    // Fall through to failed redirect
  }

  return NextResponse.redirect(
    `${origin}/track?code=${encodeURIComponent(orderCode)}&payment=failed`
  );
}
