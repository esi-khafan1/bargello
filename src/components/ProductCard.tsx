'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { PerfumeBottleVisual } from './PerfumeBottleVisual';
import { useStore } from '@/context/StoreContext';
import {
  formatPricePerMl,
  formatToman,
  getGenderLabelFa,
  getScentFamilyLabelFa,
  toPersianDigits,
} from '@/lib/format';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, settings } = useStore();
  const isOut = product.stock_count <= 0;
  const showBogo = product.is_bogo_eligible && settings.bogo_enabled;

  return (
    <article className="product-card">
      <Link
        href={`/products/${product.slug}`}
        className="product-card-media"
        aria-label={product.name_fa}
      >
        <div className="product-card-badges">
          {isOut ? (
            <span className="badge badge-out">ناموجود</span>
          ) : (
            <>
              {showBogo && (
                <span className="badge badge-bogo">۱+۱ عطر دوم رایگان</span>
              )}
              {product.collection_type === 'niche' && (
                <span className="badge badge-niche">NICHE EXTRAIT</span>
              )}
              {product.is_new && (
                <span className="badge badge-new">جدید</span>
              )}
            </>
          )}
        </div>

        <PerfumeBottleVisual product={product} size="md" />

        {/* Secondary Olfactory Pyramid Hover Visual */}
        <div className="product-hover-notes">
          <span
            className="font-en-serif"
            style={{
              fontSize: '0.72rem',
              color: '#8e6d31',
              marginBottom: 6,
            }}
          >
            OLFACTORY NOTES
          </span>
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#121212',
              marginBottom: 8,
            }}
          >
            طبع: {product.scent_nature}
          </div>
          {product.top_notes_fa.length > 0 && (
            <div style={{ fontSize: '0.76rem', color: '#4a4743', marginBottom: 4 }}>
              <strong>نت آغازین:</strong> {product.top_notes_fa.slice(0, 3).join('، ')}
            </div>
          )}
          {product.heart_notes_fa.length > 0 && (
            <div style={{ fontSize: '0.76rem', color: '#4a4743', marginBottom: 4 }}>
              <strong>نت میانی:</strong> {product.heart_notes_fa.slice(0, 3).join('، ')}
            </div>
          )}
          {product.base_notes_fa.length > 0 && (
            <div style={{ fontSize: '0.76rem', color: '#4a4743' }}>
              <strong>نت پایه:</strong> {product.base_notes_fa.slice(0, 3).join('، ')}
            </div>
          )}
          <span
            style={{
              marginTop: 12,
              fontSize: '0.75rem',
              fontWeight: 700,
              borderBottom: '1px solid #121212',
              paddingBottom: 2,
            }}
          >
            مشاهده جزئیات و هرم بویایی ←
          </span>
        </div>
      </Link>

      <div className="product-card-body">
        <div className="product-card-meta">
          <span>
            {getGenderLabelFa(product.gender)} •{' '}
            {toPersianDigits(product.volume_ml)} میل
          </span>
          <span>{getScentFamilyLabelFa(product.scent_family)}</span>
        </div>

        <Link href={`/products/${product.slug}`} className="product-card-title">
          {product.name_fa}
        </Link>

        {product.inspired_by_fa && (
          <div className="product-card-inspiration">{product.inspired_by_fa}</div>
        )}

        <div className="product-card-footer">
          <div>
            <div className="price-row">
              <span className="price-current">
                {formatToman(product.price_toman)}
              </span>
              {product.compare_at_price_toman &&
                product.compare_at_price_toman > product.price_toman && (
                  <span className="price-compare">
                    {formatToman(product.compare_at_price_toman)}
                  </span>
                )}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#7a756e', marginTop: 2 }}>
              {formatPricePerMl(product.price_toman, product.volume_ml)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              disabled={isOut}
              onClick={() => addToCart(product.id, 1, true)}
              className="btn-primary"
              style={{
                flex: 1,
                padding: '9px 10px',
                fontSize: '0.8rem',
              }}
            >
              <ShoppingBag size={15} />
              {isOut ? 'ناموجود' : 'افزودن به سبد'}
            </button>

            {showBogo && !isOut && (
              <Link
                href={`/products/${product.slug}#bogo-builder`}
                className="btn-outline"
                title="انتخاب مستقیم عطر دوم رایگان (۱+۱)"
                style={{
                  padding: '9px 10px',
                  fontSize: '0.76rem',
                  borderColor: '#9e1b32',
                  color: '#9e1b32',
                }}
              >
                <Sparkles size={14} />
                ۱+۱
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
