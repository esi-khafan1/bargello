import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { order_code, amount_toman, customer_phone } = await req.json();
  const merchantId = process.env.ZARINPAL_MERCHANT_ID;
  const isSandbox = process.env.ZARINPAL_SANDBOX === 'true';

  if (!merchantId || merchantId.startsWith('xxxxxxxx')) {
    return NextResponse.json(
      {
        configured: false,
        message:
          'کد پذیرنده زرین‌پال (ZARINPAL_MERCHANT_ID) هنوز در متغیرهای محیطی سرور تنظیم نشده است. پس از دریافت اینماد و کد پذیرنده، کافیست آن را در فایل تنظیمات سرور قرار دهید.',
      },
      { status: 200 }
    );
  }

  const baseHost = isSandbox
    ? 'https://sandbox.zarinpal.com'
    : 'https://payment.zarinpal.com';
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  try {
    const response = await fetch(
      `${baseHost}/pg/v4/payment/request.json`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId,
          amount: Math.round(Number(amount_toman)),
          currency: 'IRT',
          description: `پرداخت سفارش ${order_code} — فروشگاه عطر بارگلو`,
          callback_url: `${siteUrl}/api/payment/zarinpal/verify?order_code=${encodeURIComponent(order_code)}&amount=${Math.round(Number(amount_toman))}`,
          metadata: {
            mobile: customer_phone ?? '',
            order_id: order_code,
          },
        }),
      }
    );

    const json = await response.json();
    const authority = json?.data?.authority;

    if (json?.data?.code === 100 && authority) {
      return NextResponse.json({
        configured: true,
        payment_url: `${baseHost}/pg/StartPay/${authority}`,
        authority,
      });
    }

    return NextResponse.json(
      {
        configured: true,
        error: json?.errors?.message || 'خطا در اتصال به درگاه زرین‌پال',
      },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      {
        configured: true,
        error: 'امکان برقراری ارتباط با سرور زرین‌پال وجود ندارد.',
      },
      { status: 502 }
    );
  }
}
