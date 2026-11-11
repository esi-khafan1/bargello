'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, Package, Save, UserCheck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { getBrowserSupabase } from '@/lib/supabase';
import {
  formatDateFa,
  formatToman,
  IRAN_PROVINCES,
  toPersianDigits,
} from '@/lib/format';

export default function ProfilePage() {
  const { savedProfile, saveProfile, recentOrders, showToast } = useStore();

  const [fullName, setFullName] = useState(savedProfile.fullName);
  const [phone, setPhone] = useState(savedProfile.phone);
  const [province, setProvince] = useState(savedProfile.province || 'خوزستان');
  const [city, setCity] = useState(savedProfile.city || 'اهواز');
  const [address, setAddress] = useState(savedProfile.address);
  const [postalCode, setPostalCode] = useState(savedProfile.postalCode);

  // Supabase Auth state
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    setFullName(savedProfile.fullName);
    setPhone(savedProfile.phone);
    setProvince(savedProfile.province || 'خوزستان');
    setCity(savedProfile.city || 'اهواز');
    setAddress(savedProfile.address);
    setPostalCode(savedProfile.postalCode);
  }, [savedProfile]);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    sb.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });
  }, []);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      province,
      city: city.trim(),
      address: address.trim(),
      postalCode: postalCode.trim(),
    };
    saveProfile(updated);

    const sb = getBrowserSupabase();
    if (sb) {
      const { data } = await sb.auth.getUser();
      if (data?.user?.id) {
        await sb.from('customer_profiles').upsert({
          id: data.user.id,
          full_name: updated.fullName,
          phone: updated.phone,
          province: updated.province,
          city: updated.city,
          address: updated.address,
          postal_code: updated.postalCode,
          updated_at: new Date().toISOString(),
        });
      }
    }
    showToast('اطلاعات و آدرس پیش‌فرض شما ذخیره شد.');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = getBrowserSupabase();
    if (!sb) {
      showToast('سرویس احراز هویت در دسترس نیست.');
      return;
    }
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const { data, error } = await sb.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (error) throw error;
        if (data.user?.email) setUserEmail(data.user.email);
        showToast('حساب کاربری شما با موفقیت ایجاد شد.');
      } else {
        const { data, error } = await sb.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (error) throw error;
        if (data.user?.email) setUserEmail(data.user.email);
        showToast('خوش آمدید! وارد حساب کاربری شدید.');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ورود / عضویت');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    const sb = getBrowserSupabase();
    if (sb) await sb.auth.signOut();
    setUserEmail(null);
    showToast('از حساب کاربری خارج شدید.');
  };

  return (
    <div className="container" style={{ padding: '40px 24px 64px' }}>
      <span className="section-eyebrow">CUSTOMER ACCOUNT</span>
      <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: 24 }}>
        حساب کاربری، آدرس منتخب و سفارش‌های من
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 28,
          alignItems: 'start',
        }}
      >
        {/* Address & Profile Form */}
        <form
          onSubmit={handleSaveAddress}
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            padding: 24,
          }}
        >
          <h2 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: 16 }}>
            مشخصات و آدرس پیش‌فرض خرید سریع
          </h2>

          <div style={{ marginBottom: 12 }}>
            <label className="field-label" htmlFor="prf-name">
              نام و نام خانوادگی:
            </label>
            <input
              id="prf-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="field-label" htmlFor="prf-phone">
              شماره موبایل:
            </label>
            <input
              id="prf-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field ltr"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <label className="field-label" htmlFor="prf-prov">
                استان:
              </label>
              <select
                id="prf-prov"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="select-field"
              >
                {IRAN_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="prf-city">
                شهر:
              </label>
              <input
                id="prf-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="field-label" htmlFor="prf-addr">
              آدرس پستی کامل:
            </label>
            <textarea
              id="prf-addr"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="textarea-field"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="field-label" htmlFor="prf-zip">
              کد پستی:
            </label>
            <input
              id="prf-zip"
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="input-field ltr"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
          >
            <Save size={16} />
            <span>ذخیره اطلاعات برای خریدهای بعدی</span>
          </button>
        </form>

        {/* Right Column: Order History + Cloud Account */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Recent Orders */}
          <div
            style={{
              background: 'var(--bg-ivory)',
              border: '1px solid var(--border-light)',
              padding: 24,
            }}
          >
            <h2
              style={{
                fontSize: '1.08rem',
                fontWeight: 800,
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Package size={18} />
              <span>سفارش‌های اخیر ثبت‌شده شما</span>
            </h2>

            {recentOrders.length === 0 ? (
              <p style={{ fontSize: '0.86rem', color: 'var(--ink-muted)' }}>
                هنوز سفارشی در این مرورگر ثبت نکرده‌اید. اگر قبلاً خرید کرده‌اید،
                از بخش{' '}
                <Link
                  href="/track"
                  style={{ fontWeight: 700, textDecoration: 'underline' }}
                >
                  پیگیری سفارش
                </Link>{' '}
                استفاده نمایید.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentOrders.map((ord) => (
                  <div
                    key={ord.orderCode}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-light)',
                      padding: 14,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div>
                      <strong className="ltr" style={{ fontSize: '0.92rem' }}>
                        {ord.orderCode}
                      </strong>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--ink-muted)',
                        }}
                      >
                        {formatDateFa(ord.createdAt)} •{' '}
                        {formatToman(ord.payableTotalToman)}
                        {ord.bogoFreeUnits > 0 &&
                          ` (${toPersianDigits(ord.bogoFreeUnits)} عطر هدیه ۱+۱)`}
                      </div>
                    </div>

                    <Link
                      href={`/track?code=${encodeURIComponent(ord.orderCode)}`}
                      className="btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      جزئیات و رهگیری
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cloud Account Login/Signup */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-light)',
              padding: 24,
            }}
          >
            <h2
              style={{
                fontSize: '1.04rem',
                fontWeight: 800,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <UserCheck size={18} />
              <span>همگام‌سازی ابری حساب کاربری</span>
            </h2>

            {userEmail ? (
              <div>
                <p
                  style={{
                    fontSize: '0.86rem',
                    color: 'var(--emerald)',
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  ✓ متصل به حساب ابری: <span className="ltr">{userEmail}</span>
                </p>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="btn-outline"
                >
                  <LogOut size={15} />
                  <span>خروج از حساب</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuth}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={
                      authMode === 'login' ? 'btn-primary' : 'btn-outline'
                    }
                    style={{ flex: 1, padding: '7px 10px', fontSize: '0.8rem' }}
                  >
                    ورود به حساب
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className={
                      authMode === 'signup' ? 'btn-primary' : 'btn-outline'
                    }
                    style={{ flex: 1, padding: '7px 10px', fontSize: '0.8rem' }}
                  >
                    عضویت جدید
                  </button>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label className="field-label" htmlFor="auth-email">
                    ایمیل:
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field ltr"
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="field-label" htmlFor="auth-pass">
                    رمز عبور (حداقل ۶ کاراکتر):
                  </label>
                  <input
                    id="auth-pass"
                    type="password"
                    minLength={6}
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="input-field ltr"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn-outline"
                  style={{ width: '100%' }}
                >
                  {authLoading
                    ? 'در حال برقراری ارتباط...'
                    : authMode === 'login'
                      ? 'ورود به باشگاه مشتریان بارگلو'
                      : 'ثبت‌نام در باشگاه مشتریان'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
