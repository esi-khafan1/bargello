'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Gift,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';
import { PerfumeBottleVisual } from '@/components/PerfumeBottleVisual';
import { formatToman, toPersianDigits } from '@/lib/format';

export default function HomePage() {
  const router = useRouter();
  const {
    products,
    brands,
    categories,
    reviews,
    settings,
    addBogoPair,
  } = useStore();

  const [heroSearch, setHeroSearch] = useState('');
  const [discoveryTab, setDiscoveryTab] = useState<'most_viewed' | 'newest'>(
    'most_viewed'
  );

  const codedBogoProducts = useMemo(
    () =>
      products.filter(
        (p) => p.is_active && p.is_bogo_eligible && p.stock_count > 0
      ),
    [products]
  );

  const [firstPickId, setFirstPickId] = useState<string>('');
  const [secondPickId, setSecondPickId] = useState<string>('');

  const firstPick =
    codedBogoProducts.find((p) => p.id === firstPickId) ??
    codedBogoProducts[0];
  const secondPick =
    codedBogoProducts.find((p) => p.id === secondPickId) ??
    codedBogoProducts[1] ??
    codedBogoProducts[0];

  const bestSellers = useMemo(
    () =>
      [...products]
        .filter((p) => p.is_active && p.stock_count > 0)
        .sort((a, b) => b.sales_count - a.sales_count)
        .slice(0, 8),
    [products]
  );

  const nicheProducts = useMemo(() => {
    const nicheCat = categories.find((c) => c.slug === 'niche');
    const mystiqCat = categories.find((c) => c.slug === 'mystiq-harmony');
    return products
      .filter(
        (p) =>
          p.is_active &&
          (p.category_id === nicheCat?.id || p.category_id === mystiqCat?.id)
      )
      .slice(0, 4);
  }, [products, categories]);

  const tabProducts = useMemo(() => {
    const active = products.filter((p) => p.is_active);
    if (discoveryTab === 'newest') {
      return [...active]
        .sort((a, b) => (a.is_new === b.is_new ? 0 : a.is_new ? -1 : 1))
        .slice(0, 4);
    }
    return [...active]
      .sort((a, b) => b.views_count - a.views_count)
      .slice(0, 4);
  }, [products, discoveryTab]);

  const lifestyleProducts = useMemo(() => {
    const bodyCat = categories.find((c) => c.slug === 'body-splash');
    const carCat = categories.find((c) => c.slug === 'home-car');
    return products
      .filter(
        (p) =>
          p.is_active &&
          (p.category_id === bodyCat?.id || p.category_id === carCat?.id)
      )
      .slice(0, 4);
  }, [products, categories]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearch.trim()) {
      router.push('/collections/all');
      return;
    }
    router.push(`/collections/all?q=${encodeURIComponent(heroSearch.trim())}`);
  };

  const pairNormalTotal =
    (firstPick?.price_toman ?? 0) + (secondPick?.price_toman ?? 0);
  const pairPayable = Math.max(
    firstPick?.price_toman ?? 0,
    secondPick?.price_toman ?? 0
  );

  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-eyebrow">
                <Sparkles size={15} />
                <span>BARGELLO EUROPE • اورجینال ترکیه از سال ۱۹۵۰</span>
              </div>

              <h1 className="hero-title">
                عطر امضای خودت را با استاندارد اروپایی بارگلو انتخاب کن؛{' '}
                <span style={{ color: 'var(--crimson)' }}>
                  عطر دوم ۱۰۰٪ رایگان
                </span>
              </h1>

              <p className="hero-lead">
                کلکسیون کامل ادکلن‌های ۵۰ میل ادوپرفیوم (EDP)، کالکشن
                لاکچری نیش، بادی اسپلش و خوشبوکننده خودرو با ضمانت اصالت و
                ارسال سریع به سراسر ایران.
              </p>

              <form
                onSubmit={handleHeroSearch}
                style={{
                  display: 'flex',
                  gap: 8,
                  maxWidth: 540,
                  marginBottom: 22,
                }}
              >
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="جستجوی کد بارگلو (۵۶۱، ۱۲۲، ۷۰۹) یا برند (دیور، کرید، شنل...)"
                    className="input-field"
                    style={{ paddingLeft: 14, height: 48 }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ height: 48, padding: '0 22px' }}
                >
                  <Search size={17} />
                  <span>جستجو</span>
                </button>
              </form>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/collections/all?bogo=1" className="btn-crimson">
                  <Gift size={17} />
                  <span>خرید از کمپین ۱+۱ ادکلن</span>
                </Link>
                <Link
                  href="/collections/all?category=niche"
                  className="btn-outline"
                >
                  <span>مشاهده کالکشن نیش (Niche)</span>
                  <ArrowLeft size={16} />
                </Link>
              </div>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                padding: '28px 24px',
                boxShadow: 'var(--shadow-subtle)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                <span className="badge badge-bogo">ONE + ONE | ۱+۱ رایگان</span>
                <span
                  className="font-en-serif"
                  style={{ fontSize: '0.74rem', color: 'var(--gold-dark)' }}
                >
                  50 ML EAU DE PERFUME
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 0',
                }}
              >
                {firstPick && (
                  <div style={{ textAlign: 'center' }}>
                    <PerfumeBottleVisual product={firstPick} size="md" />
                    <div
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        marginTop: 6,
                      }}
                    >
                      کد {toPersianDigits(firstPick.code ?? '')}
                    </div>
                    <div
                      style={{ fontSize: '0.73rem', color: 'var(--ink-muted)' }}
                    >
                      {firstPick.inspired_by_en}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: 'var(--ink-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                  }}
                >
                  +
                </div>

                {secondPick && (
                  <div style={{ textAlign: 'center' }}>
                    <PerfumeBottleVisual product={secondPick} size="md" />
                    <div
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        marginTop: 6,
                      }}
                    >
                      کد {toPersianDigits(secondPick.code ?? '')}
                    </div>
                    <div
                      style={{
                        fontSize: '0.73rem',
                        color: 'var(--crimson)',
                        fontWeight: 700,
                      }}
                    >
                      ۱۰۰٪ رایگان (هدیه ۱+۱)
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.84rem',
                }}
              >
                <span style={{ color: 'var(--ink-secondary)' }}>
                  ۲ عدد ادوپرفیوم ۵۰ میل اورجینال:
                </span>
                <div>
                  <span className="price-compare" style={{ marginLeft: 8 }}>
                    {formatToman(pairNormalTotal)}
                  </span>
                  <strong style={{ color: 'var(--ink-primary)' }}>
                    {formatToman(pairPayable)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {settings.bogo_enabled && firstPick && secondPick && (
        <section
          id="bogo-pair-builder"
          style={{
            padding: '44px 0',
            background: 'var(--bg-ivory)',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div className="container">
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-strong)',
                padding: '28px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 24,
                alignItems: 'end',
              }}
            >
              <div>
                <span className="badge badge-bogo" style={{ marginBottom: 8 }}>
                  پک‌ساز هوشمند ۱+۱ بارگلو
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  پک ۲ عددی دلخواهت را بساز (عطر دوم رایگان!)
                </h2>
                <p
                  style={{
                    fontSize: '0.84rem',
                    color: 'var(--ink-secondary)',
                    marginTop: 4,
                  }}
                >
                  هر دو مورد را از بین ادکلن‌های ۵۰ میل انتخاب کنید؛ سیستم به
                  صورت خودکار یکی را ۱۰۰٪ رایگان محاسبه می‌کند.
                </p>
              </div>

              <div>
                <label className="field-label" htmlFor="home-bogo-1">
                  انتخاب عطر اول (اصلی):
                </label>
                <select
                  id="home-bogo-1"
                  value={firstPick.id}
                  onChange={(e) => setFirstPickId(e.target.value)}
                  className="select-field"
                >
                  {codedBogoProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      کد {toPersianDigits(p.code ?? '')} — {p.inspired_by_en} (
                      {formatToman(p.price_toman)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="home-bogo-2">
                  انتخاب عطر دوم (۱۰۰٪ رایگان):
                </label>
                <select
                  id="home-bogo-2"
                  value={secondPick.id}
                  onChange={(e) => setSecondPickId(e.target.value)}
                  className="select-field"
                >
                  {codedBogoProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      کد {toPersianDigits(p.code ?? '')} — {p.inspired_by_en}{' '}
                      (رایگان در پک)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => addBogoPair(firstPick.id, secondPick.id)}
                  className="btn-primary"
                  style={{ width: '100%', height: 46 }}
                >
                  <Gift size={17} />
                  <span>افزودن پک ۱+۱ ({formatToman(pairPayable)})</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section style={{ padding: '40px 0 16px' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: 18 }}>
            <div>
              <span className="section-eyebrow">OLFACTORY INSPIRATIONS</span>
              <h2 className="section-title" style={{ fontSize: '1.3rem' }}>
                انتخاب بر اساس برندهای مطرح جهانی
              </h2>
            </div>
            <Link
              href="/collections/all"
              style={{ fontSize: '0.85rem', fontWeight: 700 }}
            >
              مشاهده همه برندها ←
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))',
              gap: 10,
            }}
          >
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/collections/all?brand=${encodeURIComponent(b.slug)}`}
                style={{
                  border: '1px solid var(--border-light)',
                  padding: '12px 10px',
                  textAlign: 'center',
                  background: 'var(--bg-pure)',
                  transition: 'border-color 0.18s ease',
                }}
              >
                <div
                  className="font-en-serif"
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  {b.name_en}
                </div>
                <div
                  style={{
                    fontSize: '0.76rem',
                    color: 'var(--ink-muted)',
                    marginTop: 2,
                  }}
                >
                  {b.name_fa}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '28px 0 12px' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
            }}
          >
            {[
              {
                family: 'fresh',
                title: 'خنک و مرکباتی',
                sub: 'مناسب روزمره، بهار و تابستان (کدهای ۵۶۱، ۷۰۹، ۶۸۵)',
                accent: '#2B5B84',
              },
              {
                family: 'oriental',
                title: 'گرم، شیرین و شرقی',
                sub: 'مجلسی، اغواگر و ماندگار (کدهای ۱۲۲، ۱۹۹، ۵۹۱)',
                accent: '#9E1B32',
              },
              {
                family: 'woody',
                title: 'چوبی، تلخ و اصیل',
                sub: 'رسمی و کاریزماتیک (کدهای ۵۰۲، ۵۵۴ و سری نیش)',
                accent: '#6B4F35',
              },
              {
                family: 'floral',
                title: 'گلی و لطیف',
                sub: 'ظریف، زنانه و چهارفصل (کدهای ۳۸۴، ۲۲۶، ۱۰۶)',
                accent: '#C47D8E',
              },
            ].map((card) => (
              <Link
                key={card.family}
                href={`/collections/all?family=${card.family}`}
                style={{
                  padding: '20px 18px',
                  background: 'var(--bg-ivory)',
                  border: '1px solid var(--border-light)',
                  borderRight: `4px solid ${card.accent}`,
                }}
              >
                <span
                  className="font-en-serif"
                  style={{ fontSize: '0.7rem', color: card.accent }}
                >
                  {card.family.toUpperCase()} COLLECTION
                </span>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 800, marginTop: 4 }}>
                  {card.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--ink-secondary)',
                    marginTop: 4,
                  }}
                >
                  {card.sub}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">BEST SELLERS</span>
              <h2 className="section-title">پرفروش‌ترین عطرهای بارگلو</h2>
            </div>
            <Link
              href="/collections/all?sort=most_purchased"
              className="btn-outline"
              style={{ padding: '9px 18px', fontSize: '0.82rem' }}
            >
              مشاهده همه پرفروش‌ها ←
            </Link>
          </div>

          <div className="product-grid">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          background: '#141312',
          color: '#ffffff',
          padding: '64px 0',
        }}
      >
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow" style={{ color: '#e2c280' }}>
                BARGELLO NICHE &amp; MYSTIQ
              </span>
              <h2 className="section-title" style={{ color: '#ffffff' }}>
                کالکشن نیش و اکستریت پرفیوم (غلظت فوق‌العاده)
              </h2>
              <p
                style={{
                  fontSize: '0.88rem',
                  color: '#bdb6ac',
                  marginTop: 6,
                  maxWidth: 620,
                }}
              >
                ترکیبات دست‌ساز با اسانس‌های نادر عود، زعفران، کهربا و چوب صندل در
                شیشه‌های کلکسیونی ۱۰۰ میل ویژه مشکل‌پسندان.
              </p>
            </div>
            <Link href="/collections/all?category=niche" className="btn-gold">
              ورود به دنیای نیش ←
            </Link>
          </div>

          <div className="product-grid">
            {nicheProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-block ivory">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">TRENDING &amp; NEW ARRIVALS</span>
              <h2 className="section-title">
                {discoveryTab === 'most_viewed'
                  ? 'پربازدیدترین محصولات هفته'
                  : 'جدیدترین عطرهای اضافه‌شده'}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setDiscoveryTab('most_viewed')}
                className={
                  discoveryTab === 'most_viewed' ? 'btn-primary' : 'btn-outline'
                }
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                پربازدیدترین‌ها
              </button>
              <button
                type="button"
                onClick={() => setDiscoveryTab('newest')}
                className={
                  discoveryTab === 'newest' ? 'btn-primary' : 'btn-outline'
                }
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                جدیدترین‌ها
              </button>
            </div>
          </div>

          <div className="product-grid">
            {tabProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">BODY MIST &amp; AMBIENT</span>
              <h2 className="section-title">
                بادی اسپلش، آرایشی و خوشبوکننده خودرو و محیط
              </h2>
            </div>
            <Link
              href="/collections/all?category=body-splash"
              className="btn-outline"
              style={{ padding: '9px 18px', fontSize: '0.82rem' }}
            >
              مشاهده همه ←
            </Link>
          </div>

          <div className="product-grid">
            {lifestyleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="section-block ivory">
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">CUSTOMER REVIEWS</span>
                <h2 className="section-title">دیدگاه خریداران بارگلو</h2>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 18,
              }}
            >
              {reviews.slice(0, 3).map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    padding: 22,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: '#b8924e',
                      marginBottom: 10,
                    }}
                  >
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} size={15} fill="#b8924e" />
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: '0.88rem',
                      color: 'var(--ink-secondary)',
                      marginBottom: 14,
                    }}
                  >
                    «{rev.comment}»
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={15} color="#1b6b4a" />
                    <span>{rev.author_name}</span>
                    <span style={{ color: 'var(--ink-muted)', fontWeight: 400 }}>
                      (خریدار تاییدشده)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
