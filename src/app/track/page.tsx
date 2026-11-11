'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, PackageSearch, Truck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import {
  submitOrderReceiptCode,
  trackStoreOrder,
} from '@/lib/storeClient';
import {
  formatDateFa,
  formatToman,
  orderStatusLabelFa,
  paymentStatusLabelFa,
  toPersianDigits,
} from '@/lib/format';
import type { TrackedOrder } from '@/lib/types';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const { savedProfile, showToast } = useStore();

  const [orderCode, setOrderCode] = useState(searchParams.get('code') ?? '');
  const [phone, setPhone] = useState(savedProfile.phone ?? '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [receiptInput, setReceiptInput] = useState('');
  const [savingReceipt, setSavingReceipt] = useState(false);

  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode) {
      setOrderCode(urlCode);
    }
  }, [searchParams]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim() || !phone.trim()) return;
    setLoading(true);
    setNotFound(false);
    try {
      const found = await trackStoreOrder(orderCode.trim(), phone.trim());
      if (!found) {
        setOrder(null);
        setNotFound(true);
      } else {
        setOrder(found);
        setReceiptInput(found.receipt_reference ?? '');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در استعلام سفارش');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !receiptInput.trim()) return;
    setSavingReceipt(true);
    try {
      const ok = await submitOrderReceiptCode(
        order.order_code,
        phone.trim(),
        receiptInput.trim()
      );
      if (ok) {
        showToast('کد پیگیری واریز با موفقیت ثبت شد.');
        const refreshed = await trackStoreOrder(order.order_code, phone.trim());
        if (refreshed) setOrder(refreshed);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ثبت رسید');
    } finally {
      setSavingReceipt(false);
    }
  };

  return (
    <div className="container" style={{ padding: '44px 24px 64px', maxWidth: 820 }}>
      <span className="section-eyebrow">ORDER TRACKING</span>
      <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: 8 }}>
        پیگیری وضعیت سفارش و ثبت رسید پرداخت
      </h1>
      <p
        style={{
          fontSize: '0.9rem',
          color: 'var(--ink-secondary)',
          marginBottom: 24,
        }}
      >
        کد پیگیری سفارش (مانند <span className="ltr">BRG-123456</span>) و شماره
        موبایل ثبت‌شده در هنگام خرید را وارد نمایید.
      </p>

      <form
        onSubmit={handleLookup}
        style={{
          background: 'var(--bg-ivory)',
          border: '1px solid var(--border-light)',
          padding: 22,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          alignItems: 'end',
          marginBottom: 28,
        }}
      >
        <div>
          <label className="field-label" htmlFor="trk-code">
            کد پیگیری سفارش:
          </label>
          <input
            id="trk-code"
            type="text"
            required
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            placeholder="BRG-849201"
            className="input-field ltr"
          />
        </div>

        <div>
          <label className="field-label" htmlFor="trk-phone">
            شماره موبایل سفارش‌دهنده:
          </label>
          <input
            id="trk-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            className="input-field ltr"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ height: 44 }}
        >
          <PackageSearch size={17} />
          <span>{loading ? 'در حال استعلام...' : 'مشاهده وضعیت سفارش'}</span>
        </button>
      </form>

      {notFound && (
        <div
          style={{
            padding: 24,
            border: '1px solid var(--crimson)',
            background: 'var(--crimson-soft)',
            color: 'var(--crimson)',
            fontSize: '0.88rem',
          }}
        >
          سفارشی با این کد پیگیری و شماره موبایل یافت نشد. لطفاً صحت کد و شماره
          همراه را بررسی فرمایید.
        </div>
      )}

      {order && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--ink-primary)',
            padding: 26,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              paddingBottom: 16,
              borderBottom: '1px solid var(--border-light)',
              marginBottom: 18,
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                کد سفارش: <strong className="ltr">{order.order_code}</strong>
              </div>
              <div style={{ fontSize: '1.08rem', fontWeight: 800, marginTop: 4 }}>
                گیرنده: {order.customer_name} ({order.province} — {order.city})
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                تاریخ ثبت: {formatDateFa(order.created_at)}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: 'var(--emerald)',
                }}
              >
                وضعیت سفارش: {orderStatusLabelFa(order.order_status)}
              </div>
            </div>
          </div>

          {order.postal_tracking_code && (
            <div
              style={{
                background: 'var(--emerald-soft)',
                border: '1px solid rgba(27,107,74,0.35)',
                padding: 14,
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: '0.88rem',
              }}
            >
              <Truck size={20} color="#1b6b4a" />
              <div>
                <strong>کد رهگیری ۲۴ رقمی پست پیشتاز / تیپاکس: </strong>
                <span className="ltr" style={{ fontWeight: 800 }}>
                  {order.postal_tracking_code}
                </span>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 18 }}>
            <strong style={{ display: 'block', marginBottom: 10, fontSize: '0.9rem' }}>
              اقلام سفارش:
            </strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'var(--bg-ivory)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <strong>{toPersianDigits(item.quantity)}×</strong>{' '}
                    {item.product_name_fa}
                    {item.free_quantity > 0 && (
                      <span
                        className="badge badge-bogo"
                        style={{ marginRight: 8 }}
                      >
                        {toPersianDigits(item.free_quantity)} رایگان (۱+۱)
                      </span>
                    )}
                  </div>
                  <strong>
                    {item.line_total_toman === 0
                      ? 'رایگان'
                      : formatToman(item.line_total_toman)}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--border-light)',
              paddingTop: 14,
              marginBottom: 20,
              fontSize: '0.88rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 10,
            }}
          >
            <div>
              وضعیت پرداخت:{' '}
              <strong>{paymentStatusLabelFa(order.payment_status)}</strong>
            </div>
            <div>
              تخفیف ۱+۱:{' '}
              <strong style={{ color: 'var(--crimson)' }}>
                {formatToman(order.bogo_discount_toman)}
              </strong>
            </div>
            <div>
              مبلغ نهایی:{' '}
              <strong>{formatToman(order.payable_total_toman)}</strong>
            </div>
          </div>

          {order.payment_status !== 'paid' && (
            <form
              onSubmit={handleSaveReceipt}
              style={{
                background: 'var(--gold-soft)',
                border: '1px solid rgba(184,146,78,0.4)',
                padding: 16,
              }}
            >
              <label className="field-label" htmlFor="rcpt-code">
                ثبت یا ویرایش کد پیگیری فیش کارت‌به‌کارت:
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  id="rcpt-code"
                  type="text"
                  value={receiptInput}
                  onChange={(e) => setReceiptInput(e.target.value)}
                  placeholder="کد پیگیری بانکی یا ۴ رقم آخر کارت"
                  className="input-field"
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  disabled={savingReceipt}
                  className="btn-primary"
                >
                  <CheckCircle2 size={16} />
                  <span>{savingReceipt ? 'در حال ثبت...' : 'ثبت رسید پرداخت'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: '48px 24px' }}>
          در حال بارگذاری سامانه پیگیری...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
