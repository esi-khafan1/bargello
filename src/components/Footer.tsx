'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, PhoneCall, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { toPersianDigits } from '@/lib/format';

export const Footer: React.FC = () => {
  const { settings } = useStore();

  return (
    <footer className="site-footer">
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
            paddingBottom: 40,
            marginBottom: 40,
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldCheck size={28} color="#e2c280" />
            <div>
              <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem' }}>
                ضمانت ۱۰۰٪ اصالت بارگلو ترکیه
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#a8a29e' }}>
                واردات مستقیم از کارخانه رسمی بورسای ترکیه (تأسیس ۱۹۵۰)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Sparkles size={28} color="#e2c280" />
            <div>
              <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem' }}>
                طرح همیشگی ۱+۱ ادکلن
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#a8a29e' }}>
                با خرید هر ادکلن ۵۰ میل، ادکلن دوم ۱۰۰٪ رایگان محاسبه می‌شود
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Truck size={28} color="#e2c280" />
            <div>
              <strong style={{ display: 'block', color: '#fff', fontSize: '0.9rem' }}>
                ارسال سریع به سراسر ایران
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#a8a29e' }}>
                بسته‌بندی ضدضربه لوکس + کد رهگیری پستی و تحویل فوری اهواز
              </span>
            </div>
          </div>
        </div>

        <div className="footer-grid">
          <div>
            <div
              className="font-en-serif"
              style={{
                fontSize: '1.5rem',
                color: '#ffffff',
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              BARGELLO
            </div>
            <p
              style={{
                fontSize: '0.85rem',
                color: '#bdb6ac',
                lineHeight: 1.85,
                marginBottom: 14,
              }}
            >
              خانه تخصصی عطر و ادکلن اورجینال بارگلو ترکیه در ایران. مجموعه‌ای از
              بیش از ۳۰۰ رایحه هم‌راستا با شاهکارهای عطرسازی جهان با غلظت ادوپرفیوم
              (EDP) و ماندگاری تضمین‌شده.
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                fontSize: '0.84rem',
                color: '#e2c280',
              }}
            >
              <a
                href={`tel:${settings.phone_number}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <PhoneCall size={15} />
                <span>تلفن مشاوره و سفارش: </span>
                <span className="ltr">
                  {toPersianDigits(settings.phone_number)}
                </span>
              </a>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#d6d3d1',
                }}
              >
                <MapPin size={15} />
                <span>{settings.address_fa}</span>
              </div>
            </div>
          </div>

          <div>
            <h3
              style={{
                fontSize: '0.95rem',
                color: '#ffffff',
                marginBottom: 14,
                fontWeight: 700,
              }}
            >
              دسته‌بندی محصولات
            </h3>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 9,
                fontSize: '0.84rem',
                color: '#bdb6ac',
              }}
            >
              <li>
                <Link href="/collections/all?category=coded-perfumes">
                  ادکلن
                </Link>
              </li>
              <li>
                <Link href="/collections/all?category=niche">
                  کالکشن نیش و اکستریت (Niche)
                </Link>
              </li>
              <li>
                <Link href="/collections/all?sort=most_purchased">
                  پرفروش‌ترین عطرهای بارگلو
                </Link>
              </li>
              <li>
                <Link href="/collections/all?sort=newest">
                  جدیدترین محصولات
                </Link>
              </li>
              <li>
                <Link href="/collections/all?category=body-splash">
                  بادی اسپلش و محصولات آرایشی
                </Link>
              </li>
              <li>
                <Link href="/collections/all?category=home-car">
                  خوشبوکننده خودرو و دیفیوزر محیط
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3
              style={{
                fontSize: '0.95rem',
                color: '#ffffff',
                marginBottom: 14,
                fontWeight: 700,
              }}
            >
              خدمات مشتریان
            </h3>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 9,
                fontSize: '0.84rem',
                color: '#bdb6ac',
              }}
            >
              <li>
                <Link href="/track">پیگیری سفارش و ثبت فیش واریزی</Link>
              </li>
              <li>
                <Link href="/profile">حساب کاربری و تاریخچه خرید</Link>
              </li>
              <li>
                <Link href="/pages/about">درباره بارگلو خوزستان و اصالت کالا</Link>
              </li>
              <li>
                <Link href="/pages/terms">قوانین و مقررات خرید</Link>
              </li>
              <li>
                <Link href="/pages/privacy">سیاست حفظ حریم خصوصی</Link>
              </li>
              <li>
                <Link href="/pages/complaints">ثبت شکایات و پیشنهادات</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3
              style={{
                fontSize: '0.95rem',
                color: '#ffffff',
                marginBottom: 14,
                fontWeight: 700,
              }}
            >
              راهنمای سریع کدهای محبوب
            </h3>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 16,
              }}
            >
              {[
                { label: 'کد ۵۶۱ • ساواج', q: '561' },
                { label: 'کد ۱۲۲ • گودگرل', q: '122' },
                { label: 'کد ۷۰۹ • اونتوس', q: '709' },
                { label: 'کد ۱۹۹ • باکارات', q: '199' },
                { label: 'کد ۳۸۴ • لیبره', q: '384' },
                { label: 'کد ۶۸۵ • بلو شنل', q: '685' },
              ].map((item) => (
                <Link
                  key={item.q}
                  href={`/collections/all?q=${item.q}`}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 9px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#eae5dd',
                    borderRadius: 2,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <Link
              href="/admin"
              style={{
                fontSize: '0.78rem',
                color: '#e2c280',
                borderBottom: '1px dashed rgba(226,194,128,0.5)',
              }}
            >
              ورود به پنل مدیریت فروشگاه ←
            </Link>
          </div>
        </div>

        <div
          style={{
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: '0.78rem',
            color: '#8c857c',
          }}
        >
          <span>
            © {toPersianDigits(1405)} کلیه حقوق برای فروشگاه رسمی عطر بارگلو محفوظ است.
          </span>
          <span className="font-en-serif" style={{ letterSpacing: '0.16em' }}>
            BARGELLO PERFUME SINCE 1950
          </span>
        </div>
      </div>
    </footer>
  );
};
