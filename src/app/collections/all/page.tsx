'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';
import { filterAndSortProducts, type SortMode } from '@/lib/catalogFilter';
import { toPersianDigits } from '@/lib/format';
import type { ScentFamily } from '@/lib/types';

function CollectionsCatalogContent() {
  const searchParams = useSearchParams();
  const { products, categories, brands } = useStore();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [categorySlug, setCategorySlug] = useState(
    searchParams.get('category') ?? 'all'
  );
  const [gender, setGender] = useState<'all' | 'men' | 'women' | 'unisex'>(
    (searchParams.get('gender') as 'all' | 'men' | 'women' | 'unisex') || 'all'
  );
  const [scentFamily, setScentFamily] = useState<'all' | ScentFamily>(
    ((searchParams.get('family') ?? 'all').toLowerCase() as
      | 'all'
      | ScentFamily) || 'all'
  );
  const [scentNatureKeyword, setScentNatureKeyword] = useState('all');
  const [brandSlug, setBrandSlug] = useState(
    searchParams.get('brand') ?? 'all'
  );
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyBogo, setOnlyBogo] = useState(searchParams.get('bogo') === '1');
  const [sort, setSort] = useState<SortMode>(
    (searchParams.get('sort') as SortMode) || 'most_purchased'
  );

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
    setCategorySlug(searchParams.get('category') ?? 'all');
    setGender(
      (searchParams.get('gender') as 'all' | 'men' | 'women' | 'unisex') ||
        'all'
    );
    setScentFamily(
      ((searchParams.get('family') ?? 'all').toLowerCase() as
        | 'all'
        | ScentFamily) || 'all'
    );
    setBrandSlug(searchParams.get('brand') ?? 'all');
    setOnlyBogo(searchParams.get('bogo') === '1');
    setSort((searchParams.get('sort') as SortMode) || 'most_purchased');
  }, [searchParams]);

  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(
        products,
        categories,
        {
          query,
          categorySlug,
          gender,
          scentFamily,
          scentNatureKeyword,
          brandSlug,
          onlyInStock,
          onlyBogo,
          sort,
        },
        brands
      ),
    [
      products,
      categories,
      brands,
      query,
      categorySlug,
      gender,
      scentFamily,
      scentNatureKeyword,
      brandSlug,
      onlyInStock,
      onlyBogo,
      sort,
    ]
  );

  const resetAllFilters = () => {
    setQuery('');
    setCategorySlug('all');
    setGender('all');
    setScentFamily('all');
    setScentNatureKeyword('all');
    setBrandSlug('all');
    setOnlyInStock(false);
    setOnlyBogo(false);
    setSort('most_purchased');
  };

  return (
    <div style={{ paddingBottom: 48 }}>
      <div
        style={{
          background: 'var(--bg-ivory)',
          borderBottom: '1px solid var(--border-light)',
          padding: '34px 0',
          marginBottom: 28,
        }}
      >
        <div className="container">
          <span className="section-eyebrow">BARGELLO COMPLETE CATALOG</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            فروشگاه تخصصی عطر و ادکلن بارگلو
          </h1>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--ink-secondary)',
              marginTop: 6,
            }}
          >
            جستجو بر اساس کد سه رقمی بارگلو، برند جهانی الهام‌بخش، خانواده بویایی
            و طبع عطر.
          </p>
        </div>
      </div>

      <div className="container">
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          <button
            type="button"
            onClick={() => setCategorySlug('all')}
            className={categorySlug === 'all' ? 'btn-primary' : 'btn-outline'}
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            همه دسته‌ها
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategorySlug(cat.slug)}
              className={
                categorySlug === cat.slug ? 'btn-primary' : 'btn-outline'
              }
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              {cat.name_fa}
            </button>
          ))}
        </div>

        <div
          style={{
            background: 'var(--bg-pure)',
            border: '1px solid var(--border-light)',
            padding: 18,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div style={{ gridColumn: 'span 2' }}>
              <label className="field-label" htmlFor="catalog-search">
                جستجوی کد بارگلو، نام برند یا نت بویایی:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="catalog-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="مثلاً: ۵۶۱، 122، Dior Sauvage، باکارات، وانیل..."
                  className="input-field"
                  style={{ paddingLeft: 36 }}
                />
                <Search
                  size={17}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#7a756e',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="filter-gender">
                جنسیت:
              </label>
              <select
                id="filter-gender"
                value={gender}
                onChange={(e) =>
                  setGender(
                    e.target.value as 'all' | 'men' | 'women' | 'unisex'
                  )
                }
                className="select-field"
              >
                <option value="all">همه (مردانه، زنانه، یونیسکس)</option>
                <option value="men">مردانه</option>
                <option value="women">زنانه</option>
                <option value="unisex">یونیسکس (مشترک)</option>
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="filter-family">
                خانواده بویایی:
              </label>
              <select
                id="filter-family"
                value={scentFamily}
                onChange={(e) =>
                  setScentFamily(e.target.value as 'all' | ScentFamily)
                }
                className="select-field"
              >
                <option value="all">همه گروه‌های بویایی</option>
                <option value="fresh">خنک و مرکباتی (FRESH)</option>
                <option value="oriental">گرم و شرقی (ORIENTAL)</option>
                <option value="woody">چوبی و تلخ (WOODY)</option>
                <option value="floral">گلی و لطیف (FLORAL)</option>
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="filter-nature">
                طبع عطر:
              </label>
              <select
                id="filter-nature"
                value={scentNatureKeyword}
                onChange={(e) => setScentNatureKeyword(e.target.value)}
                className="select-field"
              >
                <option value="all">همه طبع‌ها</option>
                <option value="گرم">طبع گرم</option>
                <option value="خنک">طبع خنک</option>
                <option value="شیرین">رایحه شیرین</option>
                <option value="تلخ">رایحه تلخ</option>
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="filter-brand">
                الهام از برند جهانی:
              </label>
              <select
                id="filter-brand"
                value={brandSlug}
                onChange={(e) => setBrandSlug(e.target.value)}
                className="select-field"
              >
                <option value="all">همه برندهای جهانی</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.slug}>
                    {b.name_fa} ({b.name_en})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
              paddingTop: 14,
              borderTop: '1px solid var(--border-light)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                flexWrap: 'wrap',
              }}
            >
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                />
                <span>فقط محصولات موجود</span>
              </label>

              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: 'var(--crimson)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={onlyBogo}
                  onChange={(e) => setOnlyBogo(e.target.checked)}
                />
                <span>فقط شامل طرح ۱+۱ رایگان</span>
              </label>

              <button
                type="button"
                onClick={resetAllFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '0.8rem',
                  color: 'var(--ink-muted)',
                }}
              >
                <RotateCcw size={14} />
                <span>پاک کردن فیلترها</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
                {toPersianDigits(filteredProducts.length)} محصول
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <SlidersHorizontal size={15} color="#7a756e" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortMode)}
                  className="select-field"
                  style={{ width: 'auto', padding: '7px 12px', fontSize: '0.82rem' }}
                  aria-label="مرتب‌سازی محصولات"
                >
                  <option value="most_purchased">پرفروش‌ترین</option>
                  <option value="most_viewed">پربازدیدترین</option>
                  <option value="newest">جدیدترین</option>
                  <option value="price_asc">ارزان‌ترین</option>
                  <option value="price_desc">گران‌ترین</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px 20px',
              background: 'var(--bg-ivory)',
              border: '1px solid var(--border-light)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>
              محصولی مطابق با فیلترهای انتخابی شما یافت نشد.
            </h3>
            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--ink-secondary)',
                marginBottom: 18,
              }}
            >
              پیشنهاد می‌کنیم فیلترها را بازنشانی کنید یا کد سه رقمی دیگری را جستجو
              نمایید.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="btn-primary"
            >
              نمایش همه محصولات بارگلو
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectionsAllPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: '64px 24px' }}>
          در حال بارگذاری کاتالوگ عطرها...
        </div>
      }
    >
      <CollectionsCatalogContent />
    </Suspense>
  );
}
