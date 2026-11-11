'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, PhoneCall, Send, ShieldCheck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { submitSupportMessage } from '@/lib/storeClient';
import { toPersianDigits } from '@/lib/format';

export default function StaticContentPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? 'about';
  const { settings, showToast } = useStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [subject, setSubject] = useState('پیگیری سفارش / پیشنهاد');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await submitSupportMessage({
        full_name: fullName.trim(),
        phone: phone.trim(),
        order_code: orderCode.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      setSent(true);
      showToast('پیام شما در سامانه پشتیبانی ثبت شد.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ارسال پیام');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container" style={{ padding: '44px 24px 64px', maxWidth: 880 }}>
      {/* Sub-navigation across static pages */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 28,
        }}
      >
        {[
          { key: 'about', label: 'درباره ما و اصالت بارگلو' },
          { key: 'terms', label: 'قوانین و مقررات خرید' },
          { key: 'privacy', label: 'سیاست حریم خصوصی' },
          { key: 'complaints', label: 'ثبت شکایات و ارتباط با مدیریت' },
        ].map((item) => (
          <Link
            key={item.key}
            href={`/pages/${item.key}`}
            className={slug === item.key ? 'btn-primary' : 'btn-outline'}
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {slug === 'about' && (
        <article
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            padding: '36px 32px',
            lineHeight: 1.95,
          }}
        >
          <span className="section-eyebrow">SINCE 1950 • BURSA, TURKEY</span>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: 16 }}>
            درباره عطر بارگلو (Bargello) و نمایندگی فروش در ایران
          </h1>
          <p style={{ marginBottom: 16, color: 'var(--ink-secondary)' }}>
            برند <strong>بارگلو (Bargello Perfume)</strong> با بیش از هفت دهه
            سابقه (تأسیس ۱۹۵۰ در ترکیه و آغاز فعالیت کارخانه مدرن بورسا با نام
            گنجا پلاستیک و بارگلو)، امروز در بیش از ۳۰ کشور اروپایی و آسیایی بیش
            از ۳۵۰ شعبه رسمی دارد. راز محبوبیت جهانی بارگلو ترکیب اسانس‌های خالص
            اروپایی با غلظت ادوپرفیوم (EDP) و قیمت منصفانه است.
          </p>
          <p style={{ marginBottom: 20, color: 'var(--ink-secondary)' }}>
            در فروشگاه آنلاین بارگلو (خوزستان / ارسال سراسری ایران)، کلیه ادکلن‌های
            کددار ۵۰ میل، کالکشن نیش و اکستریت ۱۰۰ میل، بادی اسپلش‌ها و عطرهای
            خودرو مستقیماً با <strong>ضمانت ۱۰۰٪ اصالت اورجینال ترکیه</strong> و
            پلمپ شرکتی عرضه می‌گردند.
          </p>

          <div
            style={{
              background: 'var(--bg-ivory)',
              border: '1px solid var(--border-light)',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontSize: '0.9rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="#1b6b4a" />
              <strong>آدرس مرکز فروش:</strong> {settings.address_fa}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PhoneCall size={18} color="#8e6d31" />
              <strong>تلفن تماس مستقیم و مشاوره رایحه:</strong>{' '}
              <span className="ltr">
                {toPersianDigits(settings.phone_number)}
              </span>
            </div>
          </div>
        </article>
      )}

      {slug === 'terms' && (
        <article
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            padding: '36px 32px',
            lineHeight: 1.95,
          }}
        >
          <span className="section-eyebrow">TERMS &amp; CONDITIONS</span>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: 16 }}>
            قوانین و مقررات خرید و شرایط کمپین ۱+۱
          </h1>
          <ul
            style={{
              paddingRight: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              color: 'var(--ink-secondary)',
            }}
          >
            <li>
              <strong>قانون کمپین ۱+۱ عطرهای کددار:</strong> به ازای هر جفت عطر
              مشمول طرح ۱+۱ در سبد خرید، عطر هم‌قیمت یا ارزان‌تر در هر جفت با ۱۰۰٪
              تخفیف (رایگان) محاسبه می‌گردد. محدودیتی در تعداد جفت‌ها وجود ندارد
              (خرید ۲ عدد = پرداخت ۱ عدد، خرید ۴ عدد = پرداخت ۲ عدد).
            </li>
            <li>
              <strong>ضمانت اصالت و سلامت فیزیکی:</strong> تمامی شیشه‌ها پیش از
              ارسال از نظر سلامت والو و پلمپ بررسی شده و در بسته‌بندی حباب‌دار
              مخصوص ارسال می‌شوند.
            </li>
            <li>
              <strong>شرایط بازگشت کالا:</strong> به دلیل ماهیت بهداشتی عطر و
              ادکلن، بازگشت یا تعویض صرفاً تا ۷ روز در صورت باز نشدن سلفون و پلمپ
              جعبه امکان‌پذیر است. در صورت آسیب‌دیدگی در حمل‌ونقل پستی، با ارائه
              تصویر بسته هنگام تحویل، محصول جایگزین بدون هزینه ارسال می‌گردد.
            </li>
            <li>
              <strong>زمان تحویل:</strong> سفارش‌های اهواز به صورت فوری با پیک و
              سفارش‌های سایر شهرهای ایران ظرف ۲ تا ۴ روز کاری با پست پیشتاز /
              تیپاکس ارسال می‌شوند.
            </li>
          </ul>
        </article>
      )}

      {slug === 'privacy' && (
        <article
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            padding: '36px 32px',
            lineHeight: 1.95,
          }}
        >
          <span className="section-eyebrow">PRIVACY POLICY</span>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: 16 }}>
            سیاست حفظ حریم خصوصی کاربران
          </h1>
          <p style={{ marginBottom: 14, color: 'var(--ink-secondary)' }}>
            فروشگاه اینترنتی بارگلو متعهد به حفاظت کامل از اطلاعات شخصی مشتریان
            است. اطلاعات ثبت‌شده شامل نام، شماره تلفن همراه، آدرس پستی و کد پستی
            صرفاً جهت پردازش، صدور فاکتور و تحویل مرسولات پستی استفاده شده و تحت
            هیچ شرایطی در اختیار اشخاص یا مجموعه‌های ثالث قرار نمی‌گیرد.
          </p>
          <p style={{ color: 'var(--ink-secondary)' }}>
            استعلام وضعیت سفارش در صفحه پیگیری نیازمند تطابق هم‌زمان کد اختصاصی
            سفارش و شماره تلفن همراه خریدار است تا حریم خصوصی سفارش‌های شما کاملاً
            محفوظ بماند.
          </p>
        </article>
      )}

      {slug === 'complaints' && (
        <section
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            padding: '36px 32px',
          }}
        >
          <span className="section-eyebrow">CUSTOMER CARE</span>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: 10 }}>
            ثبت شکایات، انتقادات و ارتباط مستقیم با مدیریت
          </h1>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--ink-secondary)',
              marginBottom: 24,
            }}
          >
            رضایت شما اولویت نخست ماست. هرگونه تأخیر پستی، مغایرت سفارش یا پیشنهاد
            خود را ثبت فرمایید تا مستقیماً در کارتابل مدیریت بررسی و در کمتر از ۱۲
            ساعت پاسخ داده شود.
          </p>

          {sent ? (
            <div
              style={{
                background: 'var(--emerald-soft)',
                border: '1px solid rgba(27,107,74,0.35)',
                padding: 24,
                textAlign: 'center',
              }}
            >
              <CheckCircle2
                size={36}
                color="#1b6b4a"
                style={{ margin: '0 auto 10px' }}
              />
              <strong style={{ display: 'block', marginBottom: 6 }}>
                پیام شما با موفقیت ثبت گردید
              </strong>
              <span style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)' }}>
                واحد پشتیبانی بارگلو در کوتاه‌ترین زمان با شماره شما تماس خواهد
                گرفت.
              </span>
            </div>
          ) : (
            <form onSubmit={handleComplaintSubmit}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: 14,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label className="field-label" htmlFor="cmp-name">
                    نام و نام خانوادگی *
                  </label>
                  <input
                    id="cmp-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="cmp-phone">
                    شماره تماس *
                  </label>
                  <input
                    id="cmp-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field ltr"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="cmp-order">
                    کد سفارش (در صورت وجود)
                  </label>
                  <input
                    id="cmp-order"
                    type="text"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    placeholder="BRG-..."
                    className="input-field ltr"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="field-label" htmlFor="cmp-sub">
                  موضوع پیام *
                </label>
                <select
                  id="cmp-sub"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="select-field"
                >
                  <option value="پیگیری ارسال مرسوله">پیگیری ارسال مرسوله</option>
                  <option value="گزارش آسیب فیزیکی در حمل‌ونقل">
                    گزارش آسیب فیزیکی در حمل‌ونقل
                  </option>
                  <option value="مشاوره تخصصی انتخاب رایحه">
                    مشاوره تخصصی انتخاب رایحه
                  </option>
                  <option value="پیشنهاد یا انتقاد">پیشنهاد یا انتقاد</option>
                </select>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="field-label" htmlFor="cmp-msg">
                  شرح کامل پیام *
                </label>
                <textarea
                  id="cmp-msg"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="textarea-field"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-primary"
              >
                <Send size={16} />
                <span>{sending ? 'در حال ثبت...' : 'ارسال به واحد رسیدگی'}</span>
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
