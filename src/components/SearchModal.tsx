'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { filterAndSortProducts } from '@/lib/catalogFilter';
import { PerfumeBottleVisual } from './PerfumeBottleVisual';
import { formatToman, getGenderLabelFa } from '@/lib/format';

const QUICK_CHIPS = [
  '۵۶۱',
  '۱۲۲',
  '۷۰۹',
  '۱۹۹',
  'Dior Sauvage',
  'Baccarat',
  'Chanel',
  'Tom Ford',
];

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, products, categories, brands } =
    useStore();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return products.slice(0, 6);
    return filterAndSortProducts(
      products,
      categories,
      { query },
      brands
    ).slice(0, 8);
  }, [query, products, categories, brands]);

  if (!isSearchOpen) return null;

  return (
    <>
      <div
        className="backdrop-overlay"
        onClick={() => setIsSearchOpen(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="جستجوی کد بارگلو یا برند جهانی"
        style={{
          position: 'fixed',
          top: '6vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(720px, 94vw)',
          maxHeight: '86vh',
          background: 'var(--bg-pure)',
          zIndex: 105,
          border: '1px solid var(--border-strong)',
          boxShadow: 'var(--shadow-elevated)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Search size={20} color="#7a756e" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو بر اساس کد بارگلو (مثلاً ۵۶۱، ۱۲۲، 709) یا نام عطر جهانی (Dior، کرید، باکارات...)"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.96rem',
              background: 'transparent',
            }}
          />
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="icon-btn"
            aria-label="بستن جستجو"
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            padding: '10px 20px',
            background: 'var(--bg-ivory)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}>
            جستجوهای پرتکرار:
          </span>
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setQuery(chip)}
              style={{
                padding: '3px 10px',
                fontSize: '0.76rem',
                background: '#ffffff',
                border: '1px solid var(--border-strong)',
                borderRadius: 999,
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        <div style={{ overflowY: 'auto', padding: '16px 20px' }}>
          {results.length === 0 ? (
            <p
              style={{
                textAlign: 'center',
                padding: '36px 0',
                color: 'var(--ink-muted)',
              }}
            >
              عطری با عبارت «{query}» یافت نشد. کد بارگلو یا نام برند جهانی را
              امتحان کنید.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {results.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  onClick={() => setIsSearchOpen(false)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '58px 1fr auto',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 10px',
                    border: '1px solid var(--border-light)',
                    background: '#ffffff',
                  }}
                >
                  <div
                    style={{
                      background: 'var(--bg-ivory)',
                      padding: 4,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <PerfumeBottleVisual product={p} size="sm" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                      {p.name_fa}
                    </div>
                    <div
                      style={{ fontSize: '0.76rem', color: 'var(--ink-muted)' }}
                    >
                      {getGenderLabelFa(p.gender)} • طبع {p.scent_nature}
                      {p.inspired_by_fa ? ` • ${p.inspired_by_fa}` : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.86rem' }}>
                      {formatToman(p.price_toman)}
                    </div>
                    {p.is_bogo_eligible && (
                      <span className="badge badge-bogo">۱+۱</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {query.trim() && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Link
                href={`/collections/all?q=${encodeURIComponent(query)}`}
                onClick={() => setIsSearchOpen(false)}
                className="btn-outline"
              >
                مشاهده همه نتایج برای «{query}» در فروشگاه
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
