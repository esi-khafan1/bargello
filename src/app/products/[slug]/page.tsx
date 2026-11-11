'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Gift,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { PerfumeBottleVisual } from '@/components/PerfumeBottleVisual';
import { ProductCard } from '@/components/ProductCard';
import {
  incrementProductView,
  submitProductReview,
} from '@/lib/storeClient';
import {
  formatDateFa,
  formatPricePerMl,
  formatToman,
  getGenderLabelFa,
  getScentFamilyLabelFa,
  toPersianDigits,
} from '@/lib/format';

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params?.slug ?? '');

  const {
    products,
    categories,
    reviews,
    settings,
    addToCart,
    addBogoPair,
    refreshCatalog,
    showToast,
  } = useStore();

  const product = useMemo(
    () => products.find((p) => p.slug === slug),
    [products, slug]
  );

  const bogoChoices = useMemo(
    () =>
      products.filter(
        (p) => p.is_active && p.is_bogo_eligible && p.stock_count > 0
      ),
    [products]
  );

  const [secondPerfumeId, setSecondPerfumeId] = useState<string>('');
  const [qty, setQty] = useState(1);

  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (product?.id) {
      void incrementProductView(product.id);
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div
        className="container"
        style={{ padding: '72px 24px', textAlign: 'center' }}
      >
        <h1 style={{ fontSize: '1.4rem', marginBottom: 12 }}>
          محصول مورد نظر یافت نشد
        </h1>
        <p style={{ color: 'var(--ink-secondary)', marginBottom: 20 }}>
          ممکن است آدرس صفحه تغییر کرده باشد یا محصول ناموجود شده باشد.
        </p>
        <Link href="/collections/all" className="btn-primary">
          بازگشت به فروشگاه بارگلو
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.category_id);
  const isOut = product.stock_count <= 0;
  const isBogoActive = product.is_bogo_eligible && settings.bogo_enabled;

  const activeSecondPerfume =
    bogoChoices.find((p) => p.id === secondPerfumeId) ??
    bogoChoices.find((p) => p.id !== product.id) ??
    bogoChoices[0];

  const productReviews = reviews.filter((r) => r.product_id === product.id);
  const relatedProducts = products
    .filter(
      (p) =>
        p.is_active &&
        p.id !== product.id &&
        (p.scent_family === product.scent_family || p.gender === product.gender)
    )
    .slice(0, 4);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;
    setSubmittingReview(true);
    try {
      await submitProductReview({
        product_id: product.id,
        author_name: authorName.trim(),
        rating,
        comment: comment.trim(),
      });
      setAuthorName('');
      setComment('');
      showToast('دیدگاه شما با موفقیت ثبت شد.');
      await refreshCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ثبت دیدگاه');
    } finally {
      setSubmittingReview(false);
    }
  };

  const pairNormalPrice =
    product.price_toman + (activeSecondPerfume?.price_toman ?? 0);
  const pairPayablePrice = Math.max(
    product.price_toman,
    activeSecondPerfume?.price_toman ?? 0
  );

  return (
    <div style={{ padding: '28px 0 64px' }}>
      <div className="container">
        <nav
          aria-label="مسیر صفحه"
          style={{
            fontSize: '0.8rem',
            color: 'var(--ink-muted)',
            marginBottom: 24,
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <Link href="/">صفحه اصلی</Link>
          <span>/</span>
          <Link href="/collections/all">فروشگاه</Link>
          {category && (
            <>
              <span>/</span>
              <Link href={`/collections/all?category=${category.slug}`}>
                {category.name_fa}
              </Link>
            </>
          )}
          <span>/</span>
          <span style={{ color: 'var(--ink-primary)', fontWeight: 600 }}>
            {product.name_fa}
          </span>
        </nav>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 40,
            alignItems: 'start',
            marginBottom: 56,
          }}
        >
          <div
            style={{
              background: 'var(--bg-ivory)',
              border: '1px solid var(--border-light)',
              padding: '44px 28px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div className="product-card-badges">
              {isOut ? (
                <span className="badge badge-out">ناموجود</span>
              ) : (
                <>
                  {isBogoActive && (
                    <span className="badge badge-bogo">
                      شامل کمپین ۱+۱ (عطر دوم رایگان)
                    </span>
                  )}
                  {product.collection_type === 'niche' && (
                    <span className="badge badge-niche">NICHE EXTRAIT</span>
                  )}
                </>
              )}
            </div>

            <PerfumeBottleVisual product={product} size="lg" />

            <div
              style={{
                marginTop: 22,
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {product.code && (
                <span
                  style={{
                    fontSize: '0.78rem',
                    padding: '4px 12px',
                    background: '#ffffff',
                    border: '1px solid var(--border-strong)',
                    fontWeight: 700,
                  }}
                >
                  کد رسمی بارگلو: {toPersianDigits(product.code)}
                </span>
              )}
              <span
                style={{
                  fontSize: '0.78rem',
                  padding: '4px 12px',
                  background: '#ffffff',
                  border: '1px solid var(--border-strong)',
                }}
              >
                غلظت: {product.concentration} •{' '}
                {toPersianDigits(product.volume_ml)} میل
              </span>
            </div>
          </div>

          <div>
            <span className="section-eyebrow">
              BARGELLO {product.scent_family.toUpperCase()}
            </span>
            <h1
              style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                lineHeight: 1.35,
                marginBottom: 8,
              }}
            >
              {product.name_fa}
            </h1>

            {product.inspired_by_fa && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--gold-soft)',
                  color: 'var(--gold-dark)',
                  border: '1px solid rgba(184,146,78,0.35)',
                  padding: '5px 12px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                <Sparkles size={15} />
                <span>{product.inspired_by_fa}</span>
              </div>
            )}

            <p
              style={{
                fontSize: '0.92rem',
                color: 'var(--ink-secondary)',
                marginBottom: 20,
                lineHeight: 1.85,
              }}
            >
              {product.description_fa}
            </p>

            <div
              style={{
                padding: '16px 18px',
                background: 'var(--bg-ivory)',
                border: '1px solid var(--border-light)',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  {product.compare_at_price_toman &&
                    product.compare_at_price_toman > product.price_toman && (
                      <div className="price-compare">
                        {formatToman(product.compare_at_price_toman)}
                      </div>
                    )}
                  <div style={{ fontSize: '1.45rem', fontWeight: 800 }}>
                    {formatToman(product.price_toman)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                    واحد حجمی:{' '}
                    {formatPricePerMl(product.price_toman, product.volume_ml)}
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  {isOut ? (
                    <span style={{ color: 'var(--crimson)' }}>ناموجود</span>
                  ) : (
                    <span style={{ color: 'var(--emerald)' }}>
                      ✓ موجود در انبار ({toPersianDigits(product.stock_count)}{' '}
                      عدد آماده ارسال)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                marginBottom: 22,
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid var(--ink-primary)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  style={{ padding: '0 14px', height: 46, fontWeight: 700 }}
                >
                  +
                </button>
                <span style={{ padding: '0 12px', fontWeight: 700 }}>
                  {toPersianDigits(qty)}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  style={{ padding: '0 14px', height: 46, fontWeight: 700 }}
                >
                  −
                </button>
              </div>

              <button
                type="button"
                disabled={isOut}
                onClick={() => addToCart(product.id, qty, true)}
                className="btn-outline"
                style={{ flex: 1, height: 46 }}
              >
                <ShoppingBag size={17} />
                <span>{isOut ? 'ناموجود' : 'افزودن تکی به سبد خرید'}</span>
              </button>
            </div>

            {isBogoActive && !isOut && activeSecondPerfume && (
              <div
                id="bogo-builder"
                style={{
                  border: '2px solid var(--crimson)',
                  background: 'var(--crimson-soft)',
                  padding: 20,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      color: 'var(--crimson)',
                      fontWeight: 800,
                      fontSize: '0.96rem',
                    }}
                  >
                    <Gift size={19} />
                    <span>انتخاب مستقیم عطر دوم رایگان (طرح ۱+۱)</span>
                  </div>
                  <span className="badge badge-bogo">۱۰۰٪ تخفیف عطر دوم</span>
                </div>

                <p
                  style={{
                    fontSize: '0.83rem',
                    color: 'var(--ink-secondary)',
                    marginBottom: 12,
                  }}
                >
                  این عطر شامل کمپین ۱+۱ بارگلو است! همین حالا عطر کددار دوم را
                  انتخاب کنید تا هر دو ادکلن با قیمت یک عدد به سبد خرید شما اضافه
                  شوند:
                </p>

                <label className="field-label" htmlFor="pdp-second-bogo">
                  عطر دوم هدیه شما:
                </label>
                <select
                  id="pdp-second-bogo"
                  value={activeSecondPerfume.id}
                  onChange={(e) => setSecondPerfumeId(e.target.value)}
                  className="select-field"
                  style={{ marginBottom: 14 }}
                >
                  {bogoChoices.map((choice) => (
                    <option key={choice.id} value={choice.id}>
                      کد {toPersianDigits(choice.code ?? '')} —{' '}
                      {choice.name_fa}
                      {choice.inspired_by_en ? ` (${choice.inspired_by_en})` : ''}
                    </option>
                  ))}
                </select>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    paddingTop: 12,
                    borderTop: '1px solid rgba(158,27,50,0.2)',
                  }}
                >
                  <div>
                    <span className="price-compare" style={{ marginLeft: 8 }}>
                      {formatToman(pairNormalPrice)}
                    </span>
                    <strong
                      style={{ fontSize: '1.08rem', color: 'var(--crimson)' }}
                    >
                      فقط {formatToman(pairPayablePrice)} برای ۲ عطر!
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      addBogoPair(product.id, activeSecondPerfume.id)
                    }
                    className="btn-crimson"
                  >
                    <Gift size={17} />
                    <span>افزودن پک ۱+۱ به سبد خرید</span>
                  </button>
                </div>
              </div>
            )}

            <div
              style={{
                border: '1px solid var(--border-light)',
                padding: '14px 18px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                fontSize: '0.84rem',
                marginBottom: 20,
              }}
            >
              <div>
                <span style={{ color: 'var(--ink-muted)' }}>جنسیت: </span>
                <strong>{getGenderLabelFa(product.gender)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--ink-muted)' }}>طبع عطر: </span>
                <strong>{product.scent_nature}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--ink-muted)' }}>گروه بویایی: </span>
                <strong>{getScentFamilyLabelFa(product.scent_family)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--ink-muted)' }}>حجم و غلظت: </span>
                <strong>
                  {toPersianDigits(product.volume_ml)} میل ({product.concentration})
                </strong>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
                fontSize: '0.8rem',
                color: 'var(--ink-secondary)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} color="#1b6b4a" />
                ضمانت اصالت بارکد ترکیه
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Truck size={16} color="#8e6d31" />
                بسته‌بندی ایمن و ارسال سراسری
              </span>
              <a
                href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
                  `سلام، درباره خرید «${product.name_fa}» سوال داشتم.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  color: '#15803d',
                  fontWeight: 700,
                }}
              >
                <MessageCircle size={15} />
                مشاوره واتساپ درباره این عطر
              </a>
            </div>
          </div>
        </div>

        <section
          style={{
            background: 'var(--bg-ivory)',
            border: '1px solid var(--border-light)',
            padding: '32px 28px',
            marginBottom: 48,
          }}
        >
          <span className="section-eyebrow">OLFACTORY PYRAMID</span>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 20 }}>
            هرم بویایی و ساختار نت‌های {product.name_fa}
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 18,
            }}
          >
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: '0.76rem',
                  color: 'var(--gold-dark)',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                ۱. نت آغازین (Top Notes)
              </div>
              <p style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                {product.top_notes_fa.length > 0
                  ? product.top_notes_fa.join(' • ')
                  : 'مرکبات تازه و نت‌های معطر'}
              </p>
              <span style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>
                رایحه نخستین در ۱۵ دقیقه ابتدایی اسپری
              </span>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: '0.76rem',
                  color: 'var(--gold-dark)',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                ۲. نت میانی / قلب عطر (Heart Notes)
              </div>
              <p style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                {product.heart_notes_fa.length > 0
                  ? product.heart_notes_fa.join(' • ')
                  : 'قلب گلی و ادویه‌ای متعادل'}
              </p>
              <span style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>
                شخصیت اصلی و خط بوی عطر پس از نشستن روی پوست
              </span>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                padding: 20,
              }}
            >
              <div
                style={{
                  fontSize: '0.76rem',
                  color: 'var(--gold-dark)',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                ۳. نت پایه و ماندگار (Base Notes)
              </div>
              <p style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                {product.base_notes_fa.length > 0
                  ? product.base_notes_fa.join(' • ')
                  : 'چوب، مشک و کهربا'}
              </p>
              <span style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>
                ماندگاری عمیق و نهایی روی لباس و پوست
              </span>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 20 }}>
            نظرات و تجربه خریداران ({toPersianDigits(productReviews.length)})
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 28,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {productReviews.length === 0 ? (
                <div
                  style={{
                    padding: 24,
                    border: '1px solid var(--border-light)',
                    color: 'var(--ink-muted)',
                    fontSize: '0.88rem',
                  }}
                >
                  اولین نفری باشید که تجربه استفاده از این عطر را ثبت می‌کند.
                </div>
              ) : (
                productReviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      padding: 18,
                      border: '1px solid var(--border-light)',
                      background: '#ffffff',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                      }}
                    >
                      <strong
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: '0.86rem',
                        }}
                      >
                        <CheckCircle2 size={14} color="#1b6b4a" />
                        {rev.author_name}
                      </strong>
                      <span
                        style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}
                      >
                        {formatDateFa(rev.created_at)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: 3,
                        color: '#b8924e',
                        marginBottom: 8,
                      }}
                    >
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} size={14} fill="#b8924e" />
                      ))}
                    </div>
                    <p style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)' }}>
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={handleReviewSubmit}
              style={{
                border: '1px solid var(--border-light)',
                background: 'var(--bg-ivory)',
                padding: 22,
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 14 }}>
                ثبت دیدگاه جدید
              </h3>

              <div style={{ marginBottom: 12 }}>
                <label className="field-label" htmlFor="rev-name">
                  نام شما:
                </label>
                <input
                  id="rev-name"
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="مثلاً: سارا محمدی"
                  className="input-field"
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label className="field-label" htmlFor="rev-rating">
                  امتیاز به ماندگاری و پخش بو:
                </label>
                <select
                  id="rev-rating"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="select-field"
                >
                  <option value={5}>۵ ستاره — فوق‌العاده</option>
                  <option value={4}>۴ ستاره — بسیار خوب</option>
                  <option value={3}>۳ ستاره — متوسط</option>
                  <option value={2}>۲ ستاره — ضعیف</option>
                  <option value={1}>۱ ستاره — ناراضی</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="field-label" htmlFor="rev-comment">
                  متن دیدگاه:
                </label>
                <textarea
                  id="rev-comment"
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="تجربه خود از رایحه، پخش بو و ماندگاری را بنویسید..."
                  className="textarea-field"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                {submittingReview ? 'در حال ثبت...' : 'ثبت دیدگاه'}
              </button>
            </form>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 20 }}>
              پیشنهادهای مشابه برای سلیقه شما
            </h2>
            <div className="product-grid">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
