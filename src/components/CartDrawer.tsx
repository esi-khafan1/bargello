'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Gift,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { PerfumeBottleVisual } from './PerfumeBottleVisual';
import { formatToman, toPersianDigits } from '@/lib/format';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    products,
    settings,
    addToCart,
    setItemQuantity,
    removeItem,
  } = useStore();

  const bogoCandidates = useMemo(
    () =>
      products.filter(
        (p) => p.is_active && p.is_bogo_eligible && p.stock_count > 0
      ),
    [products]
  );

  const [selectedFreeId, setSelectedFreeId] = useState<string>('');

  if (!isCartOpen) return null;

  const activeFreeChoiceId =
    selectedFreeId || (bogoCandidates[0]?.id ?? '');

  return (
    <>
      <div
        className="backdrop-overlay"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="سبد خرید"
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={20} />
            <strong style={{ fontSize: '1.02rem' }}>
              سبد خرید ({toPersianDigits(cart.totalUnits)} کالا)
            </strong>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="icon-btn"
            aria-label="بستن سبد خرید"
          >
            <X size={20} />
          </button>
        </div>

        {cart.lines.length > 0 && (
          <div
            style={{
              padding: '10px 20px',
              background: 'var(--bg-ivory)',
              borderBottom: '1px solid var(--border-light)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Truck size={16} color="#8e6d31" />
            {cart.amountToFreeShippingToman === 0 ? (
              <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>
                تبریک! ارسال سفارش شما به سراسر ایران رایگان است.
              </span>
            ) : (
              <span>
                فقط{' '}
                <strong>{formatToman(cart.amountToFreeShippingToman)}</strong>{' '}
                تا <strong>ارسال رایگان</strong> باقی مانده است.
              </span>
            )}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cart.lines.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '64px 16px',
                color: 'var(--ink-muted)',
              }}
            >
              <ShoppingBag
                size={42}
                style={{ margin: '0 auto 14px', opacity: 0.45 }}
              />
              <p style={{ fontSize: '0.96rem', marginBottom: 18 }}>
                سبد خرید شما در حال حاضر خالی است.
              </p>
              <Link
                href="/collections/all"
                onClick={() => setIsCartOpen(false)}
                className="btn-primary"
              >
                مشاهده کالکشن عطرها
              </Link>
            </div>
          ) : (
            <>
              {settings.bogo_enabled &&
                cart.unpairedBogoUnits > 0 &&
                bogoCandidates.length > 0 && (
                  <div
                    style={{
                      background: 'var(--crimson-soft)',
                      border: '1px solid rgba(158, 27, 50, 0.35)',
                      borderRadius: 6,
                      padding: 14,
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: 'var(--crimson)',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        marginBottom: 6,
                      }}
                    >
                      <Gift size={17} />
                      <span>هدیه ۱+۱ شما منتظر انتخاب است!</span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.79rem',
                        color: 'var(--ink-secondary)',
                        marginBottom: 10,
                      }}
                    >
                      شما تعداد فرد از عطرهای کددار انتخاب کرده‌اید. عطر کددار
                      بعدی را با <strong>۱۰۰٪ تخفیف (رایگان)</strong> همینجا
                      اضافه کنید:
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select
                        value={activeFreeChoiceId}
                        onChange={(e) => setSelectedFreeId(e.target.value)}
                        className="select-field"
                        style={{ padding: '8px 10px', fontSize: '0.8rem' }}
                        aria-label="انتخاب عطر دوم رایگان"
                      >
                        {bogoCandidates.map((cand) => (
                          <option key={cand.id} value={cand.id}>
                            کد {toPersianDigits(cand.code ?? '')} —{' '}
                            {cand.inspired_by_en || cand.name_fa}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeFreeChoiceId) {
                            addToCart(activeFreeChoiceId, 1, false);
                          }
                        }}
                        className="btn-crimson"
                        style={{
                          padding: '8px 14px',
                          fontSize: '0.78rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        + افزودن رایگان
                      </button>
                    </div>
                  </div>
                )}

              {cart.totalFreeUnits > 0 && (
                <div
                  style={{
                    background: 'var(--emerald-soft)',
                    border: '1px solid rgba(27, 107, 74, 0.3)',
                    borderRadius: 6,
                    padding: '10px 12px',
                    marginBottom: 14,
                    fontSize: '0.81rem',
                    color: 'var(--emerald)',
                    fontWeight: 700,
                  }}
                >
                  ✓ کمپین ۱+۱ فعال شد:{' '}
                  {toPersianDigits(cart.totalFreeUnits)} عدد عطر کددار با تخفیف{' '}
                  {formatToman(cart.bogoDiscountToman)} رایگان محاسبه شد!
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {cart.lines.map((line) => (
                  <div
                    key={line.product.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '72px 1fr',
                      gap: 12,
                      paddingBottom: 14,
                      borderBottom: '1px solid var(--border-light)',
                    }}
                  >
                    <div
                      style={{
                        background: 'var(--bg-ivory)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 4,
                      }}
                    >
                      <PerfumeBottleVisual product={line.product} size="sm" />
                    </div>

                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 8,
                        }}
                      >
                        <Link
                          href={`/products/${line.product.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          style={{
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            lineHeight: 1.4,
                          }}
                        >
                          {line.product.name_fa}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(line.product.id)}
                          aria-label="حذف از سبد"
                          style={{ color: 'var(--ink-muted)', padding: 2 }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {line.freeQuantity > 0 && (
                        <span
                          className="badge badge-bogo"
                          style={{ marginTop: 4 }}
                        >
                          {toPersianDigits(line.freeQuantity)} عدد رایگان در
                          طرح ۱+۱
                        </span>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 10,
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            border: '1px solid var(--border-strong)',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setItemQuantity(
                                line.product.id,
                                line.quantity + 1
                              )
                            }
                            style={{ padding: '4px 8px' }}
                            aria-label="افزایش تعداد"
                          >
                            <Plus size={13} />
                          </button>
                          <span
                            style={{
                              padding: '2px 10px',
                              fontSize: '0.84rem',
                              fontWeight: 700,
                            }}
                          >
                            {toPersianDigits(line.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setItemQuantity(
                                line.product.id,
                                line.quantity - 1
                              )
                            }
                            style={{ padding: '4px 8px' }}
                            aria-label="کاهش تعداد"
                          >
                            <Minus size={13} />
                          </button>
                        </div>

                        <div style={{ textAlign: 'left' }}>
                          {line.lineDiscountToman > 0 && (
                            <div className="price-compare">
                              {formatToman(line.lineSubtotalToman)}
                            </div>
                          )}
                          <div
                            style={{
                              fontSize: '0.9rem',
                              fontWeight: 800,
                              color:
                                line.linePayableToman === 0
                                  ? 'var(--crimson)'
                                  : 'var(--ink-primary)',
                            }}
                          >
                            {line.linePayableToman === 0
                              ? 'رایگان (۱+۱)'
                              : formatToman(line.linePayableToman)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {cart.lines.length > 0 && (
          <div
            style={{
              padding: '16px 20px 20px',
              borderTop: '1px solid var(--border-light)',
              background: 'var(--bg-ivory)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.84rem',
                marginBottom: 6,
              }}
            >
              <span>جمع کل کالاها:</span>
              <span>{formatToman(cart.subtotalToman)}</span>
            </div>

            {cart.bogoDiscountToman > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.84rem',
                  color: 'var(--crimson)',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                <span>سود شما از کمپین ۱+۱:</span>
                <span>− {formatToman(cart.bogoDiscountToman)}</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.84rem',
                marginBottom: 10,
              }}
            >
              <span>هزینه ارسال:</span>
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
                fontSize: '1.02rem',
                fontWeight: 800,
                paddingTop: 10,
                borderTop: '1px solid var(--border-strong)',
                marginBottom: 14,
              }}
            >
              <span>مبلغ قابل پرداخت:</span>
              <span>{formatToman(cart.payableTotalToman)}</span>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              ادامه جهت تسویه‌حساب و ثبت سفارش
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};
