'use client';

import React from 'react';
import Link from 'next/link';
import {
  PackageSearch,
  PhoneCall,
  Search,
  ShieldCheck,
  ShoppingBag,
  User,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { toPersianDigits } from '@/lib/format';

export const Header: React.FC = () => {
  const {
    settings,
    cart,
    setIsCartOpen,
    setIsSearchOpen,
    toastMessage,
  } = useStore();

  return (
    <>
      <div className="announcement-bar">
        <div className="announcement-inner">
          <div className="announcement-meta" style={{ fontSize: '0.78rem' }}>
            <a
              href={`tel:${settings.phone_number}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <PhoneCall size={13} />
              <span>مشاوره خرید عطر: </span>
              <span className="ltr">
                {toPersianDigits(settings.phone_number)}
              </span>
            </a>
          </div>

          <div>
            {settings.bogo_enabled && (
              <span className="announcement-pill">ONE + ONE | ۱+۱</span>
            )}
            <span>{settings.announcement_text_fa}</span>
          </div>

          <div className="announcement-meta" style={{ fontSize: '0.78rem' }}>
            <Link
              href="/track"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                color: '#e2c280',
              }}
            >
              <PackageSearch size={14} />
              <span>پیگیری سفارش</span>
            </Link>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container">
          <div className="header-top">
            <div className="header-left">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="icon-btn"
                aria-label="جستجوی کد بارگلو یا عطر"
              >
                <Search size={18} />
                <span className="announcement-meta">جستجوی کد / برند</span>
              </button>

              <Link
                href="/track"
                className="icon-btn announcement-meta"
                title="پیگیری وضعیت سفارش"
              >
                <PackageSearch size={18} />
                <span>پیگیری</span>
              </Link>
            </div>

            <Link href="/" className="brand-mark">
              <span className="brand-mark-en">BARGELLO</span>
              <span className="brand-mark-sub">
                PERFUME • عطر و ادکلن اورجینال بارگلو
              </span>
            </Link>

            <div className="header-actions">
              <Link
                href="/profile"
                className="icon-btn"
                title="حساب کاربری و سفارش‌های من"
              >
                <User size={18} />
                <span className="announcement-meta">پروفایل</span>
              </Link>

              <Link
                href="/admin"
                className="icon-btn announcement-meta"
                title="پنل مدیریت فروشگاه"
              >
                <ShieldCheck size={17} />
                <span>مدیریت</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="icon-btn"
                style={{
                  border: '1px solid var(--ink-primary)',
                  fontWeight: 700,
                }}
                aria-label="مشاهده سبد خرید"
              >
                <ShoppingBag size={18} />
                <span className="announcement-meta">سبد خرید</span>
                <span className="cart-count-badge">
                  {toPersianDigits(cart.totalUnits)}
                </span>
              </button>
            </div>
          </div>
        </div>

        <nav className="header-nav" aria-label="دسته‌بندی‌های فروشگاه">
          <div className="container">
            <ul className="header-nav-list">
              <li>
                <Link href="/" className="header-nav-link">
                  صفحه اصلی
                </Link>
              </li>
              <li>
                <Link href="/collections/all" className="header-nav-link">
                  همه محصولات
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/all?bogo=1"
                  className="header-nav-link promo"
                >
                  پیشنهاد ویژه ۱+۱ کددار
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/all?category=niche"
                  className="header-nav-link"
                >
                  کالکشن نیش (Niche)
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/all?gender=men"
                  className="header-nav-link"
                >
                  عطر مردانه
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/all?gender=women"
                  className="header-nav-link"
                >
                  عطر زنانه
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/all?category=mystiq-harmony"
                  className="header-nav-link"
                >
                  سری Mystiq &amp; Harmony
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/all?category=body-splash"
                  className="header-nav-link"
                >
                  آرایشی و بادی اسپلش
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/all?category=home-car"
                  className="header-nav-link"
                >
                  عطر خودرو و محیط
                </Link>
              </li>
              <li>
                <Link href="/pages/about" className="header-nav-link">
                  درباره ما
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {toastMessage && (
        <div className="toast-banner" role="status">
          {toastMessage}
        </div>
      )}
    </>
  );
};
