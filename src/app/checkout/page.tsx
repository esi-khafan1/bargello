'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  CreditCard,
  Gift,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { submitStoreOrder } from '@/lib/storeClient';
import {
  formatToman,
  IRAN_PROVINCES,
  normalizeDigits,
  toPersianDigits,
} from '@/lib/format';
import type { OrderReceipt, PaymentMethod } from '@/lib/types';

export default function CheckoutPage() {
  const {
    cart,
    settings,
    products,
    addToCart,
    clearCart,
    savedProfile,
    saveProfile,
    recordPlacedOrder,
    refreshCatalog,
    showToast,
  } = useStore();

  const [fullName, setFullName] = useState(savedProfile.fullName);
  const [phone, setPhone] = useState(savedProfile.phone);
  const [province, setProvince] = useState(savedProfile.province || 'خوزستان');
  const [city, setCity] = useState(savedProfile.city || 'اهواز');
  const [address, setAddress] = useState(savedProfile.address);
  const [postalCode, setPostalCode] = useState(savedProfile.postalCode);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('card_to_card');
  const [receiptRef, setReceiptRef] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [placedReceipt, setPlacedReceipt] = useState<OrderReceipt | null>(null);
  const [zarinpalNotice, setZarinpalNotice] = useState<string | null>(null);

  const bogoQuickChoices = products.filter(
    (p) => p.is_active && p.is_bogo_eligible && p.stock_count > 0
  );
  const [freePickId, setFreePickId] = useState<string>('');

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setZarinpalNotice(null);

    const cleanPhone = normalizeDigits(phone).replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg(
        'لطفاً شماره موبایل معتبر ۱۱ رقمی وارد نمایید (مثلاً ۰۹۱۲۳۴۵۶۷۸۹).'
      );
      return;
    }

    if (cart.lines.length === 0) {
      setErrorMsg('سبد خرید شما خالی است.');
      return;
    }

    setSubmitting(true);
    try {
      saveProfile({
        fullName: fullName.trim(),
        phone: cleanPhone,
        province,
        city: city.trim(),
        address: address.trim(),
        postalCode: normalizeDigits(postalCode).trim(),
      });

      const receipt = await submitStoreOrder({
        customer_name: fullName.trim(),
        customer_phone: cleanPhone,
        province,
        city: city.trim(),
        address: address.trim(),
        postal_code: normalizeDigits(postalCode).trim(),
        notes: notes.trim(),
        payment_method: paymentMethod,
        receipt_reference: normalizeDigits(receiptRef).trim(),
        items: cart.lines.map((l) => ({
          product_id: l.product.id,
          quantity: l.quantity,
        })),
      });

      recordPlacedOrder({
        orderCode: receipt.order_code,
        phone: cleanPhone,
        payableTotalToman: receipt.payable_total_toman,
        bogoFreeUnits: receipt.bogo_free_units,
        createdAt: new Date().toISOString(),
      });

      clearCart();
      void refreshCatalog();

      if (paymentMethod === 'zarinpal') {
        const zpRes = await fetch('/api/payment/zarinpal/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_code: receipt.order_code,
            amount_toman: receipt.payable_total_toman,
            customer_phone: cleanPhone,
          }),
        });
        const zpJson = await zpRes.json();
        if (zpJson.payment_url) {
          window.location.href = zpJson.payment_url;
          return;
        }
        if (zpJson.message) {
          setZarinpalNotice(zpJson.message);
        }
      }

      setPlacedReceipt(receipt);
      showToast(`سفارش شما با کد ${receipt.order_code} ثبت شد!`);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'خطا در ثبت سفارش. مجدداً تلاش کنید.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (placedReceipt) {
    const waText = [
      `سلام، سفارش جدید در سایت بارگلو ثبت شد:`,
      `کد پیگیری: ${placedReceipt.order_code}`,
      `مبلغ قابل پرداخت: ${formatToman(placedReceipt.payable_total_toman)}`,
      `نام گیرنده: ${fullName} (${city})`,
    ].join('\n');

    return (
      <div className="container" style={{ padding: '48px 24px', maxWidth: 720 }}>
        <div
          style={{
            background: '#ffffff',
            border: '2px solid var(--ink-primary)',
            padding: '36px 28px',
            textAlign: 'center',
          }}
        >
          <CheckCircle2
            size={48}
            color="#1b6b4a"
            style={{ margin: '0 auto 14px' }}
          />
          <span className="section-eyebrow">ORDER CONFIRMED</span>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, marginBottom: 8 }}>
            سفارش شما با موفقیت در سیستم بارگلو ثبت شد
          </h1>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--ink-secondary)',
              marginBottom: 24,
            }}
          >
            کد پیگیری سفارش خود را یادداشت فرمایید؛ از طریق بخش «پیگیری سفارش» در
            هر لحظه وضعیت پردازش و کد رهگیری پستی قابل مشاهده است.
          </p>

          <div
            style={{
              background: 'var(--bg-ivory)',
              border: '1px solid var(--border-strong)',
              padding: 20,
              marginBottom: 22,
            }}
          >
            <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
              کد پیگیری اختصاصی سفارش:
            </div>
            <div
              className="ltr"
              style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                letterSpacing: '0.08em',
                margin: '6px 0 14px',
              }}
            >
              {placedReceipt.order_code}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                fontSize: '0.85rem',
                textAlign: 'right',
                paddingTop: 12,
                borderTop: '1px solid var(--border-light)',
              }}
            >
              <div>
                <span>جمع اولیه: </span>
                <strong>{formatToman(placedReceipt.subtotal_toman)}</strong>
              </div>
              <div>
                <span>تخفیف ۱+۱: </span>
                <strong style={{ color: 'var(--crimson)' }}>
                  {formatToman(placedReceipt.bogo_discount_toman)} (
                  {toPersianDigits(placedReceipt.bogo_free_units)} عطر رایگان)
                </strong>
              </div>
              <div>
                <span>هزینه ارسال: </span>
                <strong>
                  {placedReceipt.shipping_toman === 0
                    ? 'رایگان'
                    : formatToman(placedReceipt.shipping_toman)}
                </strong>
              </div>
              <div>
                <span>مبلغ نهایی: </span>
                <strong>{formatToman(placedReceipt.payable_total_toman)}</strong>
              </div>
            </div>
          </div>

          {zarinpalNotice && (
            <div
              style={{
                background: 'var(--gold-soft)',
                border: '1px solid var(--gold)',
                padding: 14,
                fontSize: '0.83rem',
                marginBottom: 18,
                textAlign: 'right',
              }}
            >
              <strong>راهنمای درگاه پرداخت:</strong> {zarinpalNotice} می‌توانید
              مبلغ سفارش را از طریق کارت‌به‌کارت به شماره کارت{' '}
              <strong className="ltr">{settings.bank_card_number}</strong> واریز
              و کد پیگیری را در صفحه پیگیری ثبت نمایید.
            </div>
          )}

          {paymentMethod === 'card_to_card' && (
            <div
              style={{
                background: 'var(--bg-ivory)',
                border: '1px solid var(--border-light)',
                padding: 16,
                marginBottom: 20,
                fontSize: '0.86rem',
              }}
            >
              <div>شماره کارت رسمی جهت واریز وجه:</div>
              <div
                className="ltr"
                style={{ fontSize: '1.15rem', fontWeight: 800, margin: '6px 0' }}
              >
                {settings.bank_card_number}
              </div>
              <div style={{ color: 'var(--ink-secondary)' }}>
                به نام: {settings.bank_card_holder}
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a
              href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
                waText
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ background: '#15803d', borderColor: '#15803d' }}
            >
              <MessageCircle size={17} />
              <span>ارسال رسید و هماهنگی سریع در واتساپ</span>
            </a>

            <Link
              href={`/track?code=${encodeURIComponent(placedReceipt.order_code)}`}
              className="btn-outline"
            >
              پیگیری وضعیت سفارش
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '36px 0 64px' }}>
      <div className="container">
        <span className="section-eyebrow">SECURE CHECKOUT</span>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: 24 }}>
          تسویه‌حساب و ثبت نهایی سفارش
        </h1>

        {cart.lines.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: 'center',
              background: 'var(--bg-ivory)',
              border: '1px solid var(--border-light)',
            }}
          >
            <p style={{ marginBottom: 16 }}>سبد خرید شما خالی است.</p>
            <Link href="/collections/all" className="btn-primary">
              مشاهده عطرهای بارگلو
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmitOrder}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 32,
              alignItems: 'start',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                padding: 24,
              }}
            >
              <h2
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  marginBottom: 18,
                  paddingBottom: 10,
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                ۱. مشخصات گیرنده و آدرس تحویل پستی
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: 14,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label className="field-label" htmlFor="chk-name">
                    نام و نام خانوادگی گیرنده *
                  </label>
                  <input
                    id="chk-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثلاً: علی رضایی"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="chk-phone">
                    شماره موبایل (جهت پیامک کد رهگیری) *
                  </label>
                  <input
                    id="chk-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="input-field ltr"
                    style={{ textAlign: 'right' }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: 14,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label className="field-label" htmlFor="chk-prov">
                    استان *
                  </label>
                  <select
                    id="chk-prov"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="select-field"
                  >
                    {IRAN_PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="field-label" htmlFor="chk-city">
                    شهر *
                  </label>
                  <input
                    id="chk-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="مثلاً: اهواز، تهران، شیراز..."
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="field-label" htmlFor="chk-addr">
                  نشانی دقیق پستی (خیابان، کوچه، پلاک، واحد) *
                </label>
                <textarea
                  id="chk-addr"
                  rows={3}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="آدرس کامل جهت ارسال بسته..."
                  className="textarea-field"
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: 14,
                  marginBottom: 24,
                }}
              >
                <div>
                  <label className="field-label" htmlFor="chk-postal">
                    کد پستی ۱۰ رقمی (اختیاری)
                  </label>
                  <input
                    id="chk-postal"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="۶۱۳۵۶۷۸۹۰۱"
                    className="input-field ltr"
                    style={{ textAlign: 'right' }}
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="chk-notes">
                    توضیحات سفارش (ساعت تحویل یا کادوپیچ)
                  </label>
                  <input
                    id="chk-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثلاً: بسته‌بندی هدیه انجام شود"
                    className="input-field"
                  />
                </div>
              </div>

              <h2
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  marginBottom: 14,
                  paddingBottom: 10,
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                ۲. انتخاب روش پرداخت
              </h2>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <label
                  style={{
                    border:
                      paymentMethod === 'card_to_card'
                        ? '2px solid var(--ink-primary)'
                        : '1px solid var(--border-light)',
                    padding: 14,
                    cursor: 'pointer',
                    background:
                      paymentMethod === 'card_to_card'
                        ? 'var(--bg-ivory)'
                        : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'card_to_card'}
                      onChange={() => setPaymentMethod('card_to_card')}
                    />
                    <CreditCard size={17} />
                    <strong>کارت به کارت بانکی (تأیید فوری)</strong>
                  </div>
                  {paymentMethod === 'card_to_card' && (
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 10,
                        borderTop: '1px dashed var(--border-strong)',
                        fontSize: '0.84rem',
                      }}
                    >
                      <div>
                        شماره کارت:{' '}
                        <strong className="ltr">
                          {settings.bank_card_number}
                        </strong>{' '}
                        ({settings.bank_card_holder})
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <label className="field-label" htmlFor="chk-receipt">
                          کد پیگیری یا ۴ رقم آخر کارت واریزکننده (در صورت واریز
                          فعلی — یا بعداً در صفحه پیگیری ثبت کنید):
                        </label>
                        <input
                          id="chk-receipt"
                          type="text"
                          value={receiptRef}
                          onChange={(e) => setReceiptRef(e.target.value)}
                          placeholder="مثلاً: ۸۴۹۲۱۰ یا ۴ رقم آخر کارت"
                          className="input-field"
                        />
                      </div>
                    </div>
                  )}
                </label>

                <label
                  style={{
                    border:
                      paymentMethod === 'whatsapp'
                        ? '2px solid var(--ink-primary)'
                        : '1px solid var(--border-light)',
                    padding: 14,
                    cursor: 'pointer',
                    background:
                      paymentMethod === 'whatsapp'
                        ? 'var(--bg-ivory)'
                        : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'whatsapp'}
                      onChange={() => setPaymentMethod('whatsapp')}
                    />
                    <MessageCircle size={17} color="#15803d" />
                    <strong>ثبت فاکتور و هماهنگی پرداخت در واتساپ</strong>
                  </div>
                  <p
                    style={{
                      fontSize: '0.79rem',
                      color: 'var(--ink-secondary)',
                      marginTop: 4,
                    }}
                  >
                    فاکتور رسمی و کد پیگیری شما ثبت شده و مستقیماً برای واحد فروش
                    ارسال می‌گردد.
                  </p>
                </label>

                <label
                  style={{
                    border:
                      paymentMethod === 'zarinpal'
                        ? '2px solid var(--ink-primary)'
                        : '1px solid var(--border-light)',
                    padding: 14,
                    cursor: 'pointer',
                    background:
                      paymentMethod === 'zarinpal'
                        ? 'var(--bg-ivory)'
                        : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'zarinpal'}
                      onChange={() => setPaymentMethod('zarinpal')}
                    />
                    <ShieldCheck size={17} color="#b8924e" />
                    <strong>درگاه پرداخت آنلاین شتاب (زرین‌پال)</strong>
                  </div>
                  <p
                    style={{
                      fontSize: '0.79rem',
                      color: 'var(--ink-secondary)',
                      marginTop: 4,
                    }}
                  >
                    پرداخت آنی با کلیه کارت‌های عضو شبکه شتاب.
                  </p>
                </label>
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-ivory)',
                border: '1px solid var(--border-strong)',
                padding: 24,
              }}
            >
              <h2
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  marginBottom: 16,
                }}
              >
                خلاصه فاکتور و محاسبه کمپین ۱+۱
              </h2>

              {settings.bogo_enabled &&
                cart.unpairedBogoUnits > 0 &&
                bogoQuickChoices.length > 0 && (
                  <div
                    style={{
                      background: 'var(--crimson-soft)',
                      border: '1px solid var(--crimson)',
                      padding: 14,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--crimson)',
                        fontWeight: 800,
                        fontSize: '0.84rem',
                        marginBottom: 6,
                      }}
                    >
                      <Gift size={16} />
                      <span>عطر دوم رایگان خود را جا نگذارید!</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', marginBottom: 8 }}>
                      شما می‌توانید یک ادکلن دیگر بدون افزایش قیمت به سفارش
                      اضافه کنید:
                    </p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select
                        value={freePickId || bogoQuickChoices[0].id}
                        onChange={(e) => setFreePickId(e.target.value)}
                        className="select-field"
                        style={{ fontSize: '0.78rem', padding: '6px 8px' }}
                      >
                        {bogoQuickChoices.map((c) => (
                          <option key={c.id} value={c.id}>
                            کد {toPersianDigits(c.code ?? '')} —{' '}
                            {c.inspired_by_en || c.name_fa}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          addToCart(
                            freePickId || bogoQuickChoices[0].id,
                            1,
                            false
                          )
                        }
                        className="btn-crimson"
                        style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                      >
                        + رایگان
                      </button>
                    </div>
                  </div>
                )}

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  marginBottom: 16,
                  paddingBottom: 14,
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                {cart.lines.map((line) => (
                  <div
                    key={line.product.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.84rem',
                      gap: 10,
                    }}
                  >
                    <div>
                      <strong>{toPersianDigits(line.quantity)}×</strong>{' '}
                      {line.product.name_fa}
                      {line.freeQuantity > 0 && (
                        <span
                          style={{
                            color: 'var(--crimson)',
                            fontWeight: 700,
                            marginRight: 6,
                          }}
                        >
                          ({toPersianDigits(line.freeQuantity)} رایگان)
                        </span>
                      )}
                    </div>
                    <strong style={{ whiteSpace: 'nowrap' }}>
                      {line.linePayableToman === 0
                        ? 'رایگان'
                        : formatToman(line.linePayableToman)}
                    </strong>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.86rem',
                  marginBottom: 8,
                }}
              >
                <span>جمع کل قبل از تخفیف:</span>
                <span>{formatToman(cart.subtotalToman)}</span>
              </div>

              {cart.bogoDiscountToman > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.86rem',
                    color: 'var(--crimson)',
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  <span>
                    تخفیف ۱+۱ ({toPersianDigits(cart.totalFreeUnits)} عدد رایگان):
                  </span>
                  <span>− {formatToman(cart.bogoDiscountToman)}</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.86rem',
                  marginBottom: 14,
                }}
              >
                <span>هزینه بسته‌بندی و ارسال:</span>
                <span>
                  {cart.shippingToman === 0
                    ? 'رایگان'
                    : formatToman(cart.shippingToman)}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.12rem',
                  fontWeight: 900,
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-strong)',
                  marginBottom: 18,
                }}
              >
                <span>مبلغ قابل پرداخت:</span>
                <span>{formatToman(cart.payableTotalToman)}</span>
              </div>

              {errorMsg && (
                <div
                  style={{
                    background: 'var(--crimson-soft)',
                    border: '1px solid var(--crimson)',
                    color: 'var(--crimson)',
                    padding: 12,
                    fontSize: '0.82rem',
                    marginBottom: 14,
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ width: '100%', height: 50, fontSize: '0.96rem' }}
              >
                {submitting
                  ? 'در حال ثبت سفارش در سیستم...'
                  : 'ثبت قطعی سفارش و دریافت کد پیگیری'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
