'use client';

import React, { useState } from 'react';
import {
  Edit3,
  Lock,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Save,
  Settings,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import {
  adminDeleteProduct,
  adminUpdateOrder,
  adminUpdateSettings,
  adminUpsertProduct,
  fetchAdminDashboard,
  verifyAdminPasscode,
  type AdminDashboardData,
} from '@/lib/storeClient';
import {
  formatDateFa,
  formatToman,
  orderStatusLabelFa,
  paymentStatusLabelFa,
  toPersianDigits,
} from '@/lib/format';
import type {
  CollectionType,
  Product,
  ScentFamily,
  StoreSettings,
  TrackedOrder,
} from '@/lib/types';

type AdminTab = 'orders' | 'products' | 'settings' | 'support';

const EMPTY_PRODUCT_FORM: Partial<Product> = {
  slug: '',
  code: '',
  name_fa: '',
  name_en: '',
  collection_type: 'coded',
  gender: 'unisex',
  scent_family: 'oriental',
  scent_nature: 'گرم و شیرین',
  volume_ml: 50,
  concentration: 'EDP',
  inspired_by_fa: '',
  inspired_by_en: '',
  top_notes_fa: [],
  heart_notes_fa: [],
  base_notes_fa: [],
  description_fa: '',
  price_toman: 980000,
  compare_at_price_toman: null,
  stock_count: 25,
  is_bogo_eligible: true,
  is_featured: false,
  is_new: true,
  bottle_tint: '#E8DFCA',
  image_url: null,
  is_active: true,
};

export default function AdminDashboardPage() {
  const { categories, brands, refreshCatalog, showToast } = useStore();

  const [passcodeInput, setPasscodeInput] = useState('');
  const [activePasscode, setActivePasscode] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [tab, setTab] = useState<AdminTab>('orders');

  const [editingProduct, setEditingProduct] =
    useState<Partial<Product> | null>(null);
  const [topNotesStr, setTopNotesStr] = useState('');
  const [midNotesStr, setMidNotesStr] = useState('');
  const [baseNotesStr, setBaseNotesStr] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  const [settingsForm, setSettingsForm] = useState<StoreSettings | null>(null);
  const [newAdminPasscode, setNewAdminPasscode] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const loadDashboard = async (code: string) => {
    setLoading(true);
    try {
      const data = await fetchAdminDashboard(code);
      setDashboard(data);
      setSettingsForm(data.settings);
      setActivePasscode(code);
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'خطا در دریافت اطلاعات مدیریت'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      const valid = await verifyAdminPasscode(passcodeInput.trim());
      if (!valid) {
        setAuthError('رمز ورود مدیریت اشتباه است.');
        setLoading(false);
        return;
      }
      await loadDashboard(passcodeInput.trim());
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'خطای ارتباط با سرور');
      setLoading(false);
    }
  };

  const openProductEditor = (prod?: Product) => {
    if (prod) {
      setEditingProduct({ ...prod });
      setTopNotesStr((prod.top_notes_fa ?? []).join('، '));
      setMidNotesStr((prod.heart_notes_fa ?? []).join('، '));
      setBaseNotesStr((prod.base_notes_fa ?? []).join('، '));
    } else {
      setEditingProduct({
        ...EMPTY_PRODUCT_FORM,
        category_id: categories[0]?.id ?? null,
        inspiration_brand_id: brands[0]?.id ?? null,
      });
      setTopNotesStr('ترنج، فلفل صورتی');
      setMidNotesStr('اسطوخودوس، یاس');
      setBaseNotesStr('وانیل، چوب صندل، مشک');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePasscode || !editingProduct) return;
    setSavingProduct(true);
    try {
      const parseNotes = (raw: string) =>
        raw
          .split(/[,،]+/)
          .map((s) => s.trim())
          .filter(Boolean);

      const generatedSlug =
        editingProduct.slug?.trim() ||
        `bargello-${editingProduct.code || Date.now()}`;

      await adminUpsertProduct(activePasscode, {
        ...editingProduct,
        slug: generatedSlug,
        top_notes_fa: parseNotes(topNotesStr),
        heart_notes_fa: parseNotes(midNotesStr),
        base_notes_fa: parseNotes(baseNotesStr),
      });

      showToast('محصول با موفقیت ذخیره و به‌روزرسانی شد.');
      setEditingProduct(null);
      await loadDashboard(activePasscode);
      await refreshCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ذخیره محصول');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!activePasscode) return;
    if (!window.confirm(`آیا از حذف «${title}» اطمینان دارید؟`)) return;
    try {
      await adminDeleteProduct(activePasscode, id);
      showToast('محصول حذف شد.');
      await loadDashboard(activePasscode);
      await refreshCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در حذف محصول');
    }
  };

  const handleOrderStatusUpdate = async (
    ord: TrackedOrder,
    paymentStatus: string,
    orderStatus: string,
    postalCode: string
  ) => {
    if (!activePasscode || !ord.id) return;
    try {
      await adminUpdateOrder(
        activePasscode,
        ord.id,
        paymentStatus,
        orderStatus,
        postalCode
      );
      showToast(`سفارش ${ord.order_code} به‌روزرسانی شد.`);
      await loadDashboard(activePasscode);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ویرایش سفارش');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePasscode || !settingsForm) return;
    setSavingSettings(true);
    try {
      await adminUpdateSettings(
        activePasscode,
        settingsForm,
        newAdminPasscode.trim() || undefined
      );
      if (newAdminPasscode.trim()) {
        setActivePasscode(newAdminPasscode.trim());
        setNewAdminPasscode('');
      }
      showToast('تنظیمات فروشگاه با موفقیت ذخیره شد.');
      await refreshCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در ذخیره تنظیمات');
    } finally {
      setSavingSettings(false);
    }
  };

  if (!activePasscode || !dashboard) {
    return (
      <div
        className="container"
        style={{ padding: '64px 24px', maxWidth: 460 }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            background: '#ffffff',
            border: '1px solid var(--ink-primary)',
            padding: 32,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <Lock size={22} />
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              ورود به پنل مدیریت بارگلو
            </h1>
          </div>

          <p
            style={{
              fontSize: '0.84rem',
              color: 'var(--ink-secondary)',
              marginBottom: 18,
            }}
          >
            جهت مدیریت سفارش‌ها، موجودی انبار، قیمت عطرها و تنظیمات کمپین ۱+۱ رمز
            مدیریت را وارد نمایید.
          </p>

          <div style={{ marginBottom: 16 }}>
            <label className="field-label" htmlFor="adm-pass">
              رمز مدیریت فروشگاه:
            </label>
            <input
              id="adm-pass"
              type="password"
              required
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
              placeholder="رمز عبور مدیریت"
              className="input-field ltr"
            />
          </div>

          {authError && (
            <div
              style={{
                background: 'var(--crimson-soft)',
                color: 'var(--crimson)',
                padding: 10,
                fontSize: '0.82rem',
                marginBottom: 14,
              }}
            >
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? 'در حال بررسی رمز...' : 'ورود به پیشخوان مدیریت'}
          </button>
        </form>
      </div>
    );
  }

  const totalRevenue = dashboard.orders.reduce(
    (acc, o) => acc + Number(o.payable_total_toman || 0),
    0
  );
  const lowStockCount = dashboard.products.filter(
    (p) => p.stock_count <= 5
  ).length;

  return (
    <div className="container" style={{ padding: '32px 24px 64px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <span className="section-eyebrow">BARGELLO STORE ADMIN</span>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800 }}>
            پیشخوان مدیریت یکپارچه فروشگاه بارگلو
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => loadDashboard(activePasscode)}
            className="btn-outline"
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
          >
            <RefreshCw size={15} />
            <span>به‌روزرسانی داده‌ها</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePasscode(null);
              setDashboard(null);
              setPasscodeInput('');
            }}
            className="btn-outline"
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
          >
            <LogOut size={15} />
            <span>خروج</span>
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            background: 'var(--bg-ivory)',
            border: '1px solid var(--border-light)',
            padding: 18,
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
            مجموع فروش ثبت‌شده
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 4 }}>
            {formatToman(totalRevenue)}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-ivory)',
            border: '1px solid var(--border-light)',
            padding: 18,
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
            تعداد کل سفارش‌ها
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 4 }}>
            {toPersianDigits(dashboard.orders.length)} سفارش
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-ivory)',
            border: '1px solid var(--border-light)',
            padding: 18,
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
            کل محصولات کاتالوگ
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 4 }}>
            {toPersianDigits(dashboard.products.length)} محصول
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-ivory)',
            border: '1px solid var(--border-light)',
            padding: 18,
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
            کالاهای رو به اتمام / ناموجود
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              marginTop: 4,
              color: lowStockCount > 0 ? 'var(--crimson)' : 'var(--emerald)',
            }}
          >
            {toPersianDigits(lowStockCount)} قلم
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: 14,
          marginBottom: 24,
        }}
      >
        <button
          type="button"
          onClick={() => setTab('orders')}
          className={tab === 'orders' ? 'btn-primary' : 'btn-outline'}
          style={{ padding: '9px 18px', fontSize: '0.84rem' }}
        >
          <ShoppingBag size={16} />
          <span>سفارش‌ها ({toPersianDigits(dashboard.orders.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('products')}
          className={tab === 'products' ? 'btn-primary' : 'btn-outline'}
          style={{ padding: '9px 18px', fontSize: '0.84rem' }}
        >
          <Package size={16} />
          <span>محصولات و موجودی ({toPersianDigits(dashboard.products.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('settings')}
          className={tab === 'settings' ? 'btn-primary' : 'btn-outline'}
          style={{ padding: '9px 18px', fontSize: '0.84rem' }}
        >
          <Settings size={16} />
          <span>تنظیمات سایت و کمپین ۱+۱</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('support')}
          className={tab === 'support' ? 'btn-primary' : 'btn-outline'}
          style={{ padding: '9px 18px', fontSize: '0.84rem' }}
        >
          <span>
            پیام‌ها و شکایات ({toPersianDigits(dashboard.support_messages.length)})
          </span>
        </button>
      </div>

      {tab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {dashboard.orders.length === 0 ? (
            <div
              style={{
                padding: 36,
                textAlign: 'center',
                border: '1px solid var(--border-light)',
                color: 'var(--ink-muted)',
              }}
            >
              هنوز سفارشی ثبت نشده است.
            </div>
          ) : (
            dashboard.orders.map((ord) => (
              <AdminOrderRow
                key={ord.order_code}
                order={ord}
                onSave={handleOrderStatusUpdate}
              />
            ))
          )}
        </div>
      )}

      {tab === 'products' && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              فهرست محصولات و مدیریت قیمت / موجودی
            </h2>
            <button
              type="button"
              onClick={() => openProductEditor()}
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: '0.84rem' }}
            >
              <Plus size={16} />
              <span>افزودن محصول جدید</span>
            </button>
          </div>

          {editingProduct && (
            <form
              onSubmit={handleSaveProduct}
              style={{
                background: 'var(--bg-ivory)',
                border: '2px solid var(--ink-primary)',
                padding: 24,
                marginBottom: 28,
              }}
            >
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 16 }}>
                {editingProduct.id ? 'ویرایش محصول' : 'ثبت محصول جدید در کاتالوگ'}
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label className="field-label">عنوان فارسی محصول *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name_fa ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name_fa: e.target.value,
                      })
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="field-label">کد بارگلو (مثلاً 561)</label>
                  <input
                    type="text"
                    value={editingProduct.code ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        code: e.target.value,
                      })
                    }
                    className="input-field ltr"
                  />
                </div>

                <div>
                  <label className="field-label">نامک URL (Slug)</label>
                  <input
                    type="text"
                    value={editingProduct.slug ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        slug: e.target.value,
                      })
                    }
                    placeholder="bargello-561-edp"
                    className="input-field ltr"
                  />
                </div>

                <div>
                  <label className="field-label">دسته‌بندی</label>
                  <select
                    value={editingProduct.category_id ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category_id: e.target.value,
                      })
                    }
                    className="select-field"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_fa}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="field-label">قیمت فروش (تومان) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price_toman ?? 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price_toman: Number(e.target.value),
                      })
                    }
                    className="input-field ltr"
                  />
                </div>

                <div>
                  <label className="field-label">موجودی انبار *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock_count ?? 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock_count: Number(e.target.value),
                      })
                    }
                    className="input-field ltr"
                  />
                </div>

                <div>
                  <label className="field-label">جنسیت</label>
                  <select
                    value={editingProduct.gender ?? 'unisex'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        gender: e.target.value as 'men' | 'women' | 'unisex',
                      })
                    }
                    className="select-field"
                  >
                    <option value="men">مردانه</option>
                    <option value="women">زنانه</option>
                    <option value="unisex">یونیسکس</option>
                  </select>
                </div>

                <div>
                  <label className="field-label">گروه بویایی</label>
                  <select
                    value={editingProduct.scent_family ?? 'fresh'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        scent_family: e.target.value as ScentFamily,
                      })
                    }
                    className="select-field"
                  >
                    <option value="fresh">FRESH</option>
                    <option value="oriental">ORIENTAL</option>
                    <option value="woody">WOODY</option>
                    <option value="floral">FLORAL</option>
                  </select>
                </div>

                <div>
                  <label className="field-label">طبع عطر (فارسی)</label>
                  <input
                    type="text"
                    value={editingProduct.scent_nature ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        scent_nature: e.target.value,
                      })
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="field-label">برچسب رایحه مشابه (فارسی)</label>
                  <input
                    type="text"
                    value={editingProduct.inspired_by_fa ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        inspired_by_fa: e.target.value,
                      })
                    }
                    placeholder="رایحه مشابه دیور ساواج"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="field-label">مدل عطر جهانی (انگلیسی)</label>
                  <input
                    type="text"
                    value={editingProduct.inspired_by_en ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        inspired_by_en: e.target.value,
                      })
                    }
                    placeholder="Dior Sauvage"
                    className="input-field ltr"
                  />
                </div>

                <div>
                  <label className="field-label">نوع کالکشن / شیشه</label>
                  <select
                    value={editingProduct.collection_type ?? 'coded'}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        collection_type: e.target.value as CollectionType,
                      })
                    }
                    className="select-field"
                  >
                    <option value="coded">کلاسیک ۵۰ میل کددار</option>
                    <option value="niche">نیش اکستریت ۱۰۰ میل</option>
                    <option value="mystiq">سری Mystiq / Harmony</option>
                    <option value="body_mist">بادی اسپلش ۲۱۰ میل</option>
                    <option value="car_home">عطر خودرو و محیط</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div>
                  <label className="field-label">نت آغازین (با ویرگول جدا شود)</label>
                  <input
                    type="text"
                    value={topNotesStr}
                    onChange={(e) => setTopNotesStr(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="field-label">نت میانی (با ویرگول جدا شود)</label>
                  <input
                    type="text"
                    value={midNotesStr}
                    onChange={(e) => setMidNotesStr(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="field-label">نت پایه (با ویرگول جدا شود)</label>
                  <input
                    type="text"
                    value={baseNotesStr}
                    onChange={(e) => setBaseNotesStr(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="field-label">لینک تصویر دلخواه (اختیاری)</label>
                <input
                  type="url"
                  value={editingProduct.image_url ?? ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      image_url: e.target.value || null,
                    })
                  }
                  placeholder="https://..."
                  className="input-field ltr"
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="field-label">توضیحات تخصصی محصول</label>
                <textarea
                  rows={2}
                  value={editingProduct.description_fa ?? ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description_fa: e.target.value,
                    })
                  }
                  className="textarea-field"
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 20,
                  flexWrap: 'wrap',
                  marginBottom: 18,
                  fontSize: '0.86rem',
                }}
              >
                <label style={{ display: 'inline-flex', gap: 6, fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.is_bogo_eligible)}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        is_bogo_eligible: e.target.checked,
                      })
                    }
                  />
                  <span>شامل کمپین ۱+۱ (عطر دوم رایگان)</span>
                </label>

                <label style={{ display: 'inline-flex', gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.is_new)}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        is_new: e.target.checked,
                      })
                    }
                  />
                  <span>برچسب «جدید»</span>
                </label>

                <label style={{ display: 'inline-flex', gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={editingProduct.is_active !== false}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        is_active: e.target.checked,
                      })
                    }
                  />
                  <span>فعال و قابل نمایش در سایت</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="btn-primary"
                >
                  <Save size={16} />
                  <span>{savingProduct ? 'در حال ذخیره...' : 'ذخیره محصول'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="btn-outline"
                >
                  انصراف
                </button>
              </div>
            </form>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.84rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'var(--bg-ivory)',
                    borderBottom: '1px solid var(--border-strong)',
                    textAlign: 'right',
                  }}
                >
                  <th style={{ padding: 12 }}>کد</th>
                  <th style={{ padding: 12 }}>عنوان محصول</th>
                  <th style={{ padding: 12 }}>رایحه جهانی</th>
                  <th style={{ padding: 12 }}>قیمت</th>
                  <th style={{ padding: 12 }}>موجودی</th>
                  <th style={{ padding: 12 }}>طرح ۱+۱</th>
                  <th style={{ padding: 12 }}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.products.map((p) => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: '1px solid var(--border-light)' }}
                  >
                    <td style={{ padding: 12, fontWeight: 700 }}>
                      {p.code ? toPersianDigits(p.code) : '—'}
                    </td>
                    <td style={{ padding: 12 }}>{p.name_fa}</td>
                    <td style={{ padding: 12, color: 'var(--ink-muted)' }}>
                      {p.inspired_by_en ?? p.inspired_by_fa ?? '—'}
                    </td>
                    <td style={{ padding: 12, fontWeight: 700 }}>
                      {formatToman(p.price_toman)}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        fontWeight: 700,
                        color:
                          p.stock_count <= 0 ? 'var(--crimson)' : 'var(--emerald)',
                      }}
                    >
                      {toPersianDigits(p.stock_count)}
                    </td>
                    <td style={{ padding: 12 }}>
                      {p.is_bogo_eligible ? (
                        <span className="badge badge-bogo">فعال</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => openProductEditor(p)}
                          style={{ color: 'var(--ink-primary)' }}
                          title="ویرایش"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id, p.name_fa)}
                          style={{ color: 'var(--crimson)' }}
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'settings' && settingsForm && (
        <form
          onSubmit={handleSaveSettings}
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-light)',
            padding: 24,
            maxWidth: 780,
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 18 }}>
            تنظیمات عمومی، کمپین ۱+۱ و اطلاعات بانکی
          </h2>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 800,
                color: 'var(--crimson)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={settingsForm.bogo_enabled}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    bogo_enabled: e.target.checked,
                  })
                }
              />
              <span>
                فعال‌سازی سراسری کمپین ۱+۱ عطرهای کددار در سایت و سبد خرید
              </span>
            </label>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="field-label">متن نوار اعلان بالای سایت:</label>
            <input
              type="text"
              value={settingsForm.announcement_text_fa}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  announcement_text_fa: e.target.value,
                })
              }
              className="input-field"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div>
              <label className="field-label">سقف ارسال رایگان (تومان):</label>
              <input
                type="number"
                value={settingsForm.free_shipping_threshold_toman}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    free_shipping_threshold_toman: Number(e.target.value),
                  })
                }
                className="input-field ltr"
              />
            </div>

            <div>
              <label className="field-label">هزینه ارسال پستی (تومان):</label>
              <input
                type="number"
                value={settingsForm.shipping_cost_toman}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    shipping_cost_toman: Number(e.target.value),
                  })
                }
                className="input-field ltr"
              />
            </div>

            <div>
              <label className="field-label">تلفن پشتیبانی:</label>
              <input
                type="text"
                value={settingsForm.phone_number}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    phone_number: e.target.value,
                  })
                }
                className="input-field ltr"
              />
            </div>

            <div>
              <label className="field-label">شماره واتساپ (با کد 98):</label>
              <input
                type="text"
                value={settingsForm.whatsapp_number}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    whatsapp_number: e.target.value,
                  })
                }
                className="input-field ltr"
              />
            </div>

            <div>
              <label className="field-label">شماره کارت جهت کارت‌به‌کارت:</label>
              <input
                type="text"
                value={settingsForm.bank_card_number}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    bank_card_number: e.target.value,
                  })
                }
                className="input-field ltr"
              />
            </div>

            <div>
              <label className="field-label">نام صاحب حساب / کارت:</label>
              <input
                type="text"
                value={settingsForm.bank_card_holder}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    bank_card_holder: e.target.value,
                  })
                }
                className="input-field"
              />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="field-label">
              تغییر رمز ورود به پنل مدیریت (حداقل ۶ کاراکتر — اختیاری):
            </label>
            <input
              type="password"
              value={newAdminPasscode}
              onChange={(e) => setNewAdminPasscode(e.target.value)}
              placeholder="رمز مدیریت جدید"
              className="input-field ltr"
            />
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="btn-primary"
          >
            <Save size={16} />
            <span>
              {savingSettings ? 'در حال ذخیره...' : 'ذخیره تنظیمات فروشگاه'}
            </span>
          </button>
        </form>
      )}

      {tab === 'support' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {dashboard.support_messages.length === 0 ? (
            <div
              style={{
                padding: 32,
                textAlign: 'center',
                border: '1px solid var(--border-light)',
                color: 'var(--ink-muted)',
              }}
            >
              پیام یا شکایتی ثبت نشده است.
            </div>
          ) : (
            dashboard.support_messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  border: '1px solid var(--border-light)',
                  padding: 18,
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
                  <strong>
                    {msg.subject} — {msg.full_name} ({msg.phone})
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                    {formatDateFa(msg.created_at)}
                  </span>
                </div>
                {msg.order_code && (
                  <div style={{ fontSize: '0.8rem', marginBottom: 6 }}>
                    کد سفارش مرتبط:{' '}
                    <strong className="ltr">{msg.order_code}</strong>
                  </div>
                )}
                <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const AdminOrderRow: React.FC<{
  order: TrackedOrder;
  onSave: (
    ord: TrackedOrder,
    paymentStatus: string,
    orderStatus: string,
    postalCode: string
  ) => Promise<void>;
}> = ({ order, onSave }) => {
  const [paymentStatus, setPaymentStatus] = useState<string>(
    order.payment_status
  );
  const [orderStatus, setOrderStatus] = useState<string>(order.order_status);
  const [postalCode, setPostalCode] = useState(
    order.postal_tracking_code ?? ''
  );
  const [saving, setSaving] = useState(false);

  return (
    <div
      style={{
        border: '1px solid var(--border-strong)',
        padding: 18,
        background: '#ffffff',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div>
          <strong className="ltr" style={{ fontSize: '1rem' }}>
            {order.order_code}
          </strong>{' '}
          — <strong>{order.customer_name}</strong> ({order.customer_phone}) •{' '}
          {order.province}، {order.city}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
          {formatDateFa(order.created_at)} | مبلغ:{' '}
          <strong style={{ color: 'var(--ink-primary)' }}>
            {formatToman(order.payable_total_toman)}
          </strong>
        </div>
      </div>

      {order.address && (
        <div
          style={{
            fontSize: '0.82rem',
            color: 'var(--ink-secondary)',
            marginBottom: 10,
          }}
        >
          آدرس: {order.address}
          {order.receipt_reference && (
            <span style={{ marginRight: 14, color: 'var(--crimson)' }}>
              | رسید ثبت‌شده مشتری: <strong>{order.receipt_reference}</strong>
            </span>
          )}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 14,
          fontSize: '0.8rem',
        }}
      >
        {(order.items ?? []).map((it, idx) => (
          <span
            key={idx}
            style={{
              background: 'var(--bg-ivory)',
              border: '1px solid var(--border-light)',
              padding: '4px 10px',
            }}
          >
            {toPersianDigits(it.quantity)}× {it.product_name_fa}
            {it.free_quantity > 0 &&
              ` (${toPersianDigits(it.free_quantity)} هدیه ۱+۱)`}
          </span>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 10,
          alignItems: 'end',
          paddingTop: 12,
          borderTop: '1px solid var(--border-light)',
        }}
      >
        <div>
          <label className="field-label">
            وضعیت پرداخت ({paymentStatusLabelFa(order.payment_status)})
          </label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="select-field"
            style={{ padding: '7px 10px', fontSize: '0.82rem' }}
          >
            <option value="pending">در انتظار پرداخت</option>
            <option value="receipt_submitted">رسید ثبت شده (نیازمند بررسی)</option>
            <option value="paid">پرداخت تایید شد</option>
            <option value="failed">ناموفق / لغو</option>
          </select>
        </div>

        <div>
          <label className="field-label">
            وضعیت ارسال ({orderStatusLabelFa(order.order_status)})
          </label>
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            className="select-field"
            style={{ padding: '7px 10px', fontSize: '0.82rem' }}
          >
            <option value="pending_confirmation">ثبت شده — در انتظار تأیید</option>
            <option value="processing">در حال بسته‌بندی</option>
            <option value="shipped">تحویل به پست</option>
            <option value="delivered">تحویل شده</option>
            <option value="cancelled">لغو شده</option>
          </select>
        </div>

        <div>
          <label className="field-label">کد رهگیری پستی:</label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="۲۴ رقم پست پیشتاز"
            className="input-field ltr"
            style={{ padding: '7px 10px', fontSize: '0.82rem' }}
          />
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onSave(order, paymentStatus, orderStatus, postalCode);
            setSaving(false);
          }}
          className="btn-primary"
          style={{ padding: '9px 14px', fontSize: '0.82rem' }}
        >
          {saving ? 'ذخیره...' : 'ثبت تغییرات سفارش'}
        </button>
      </div>
    </div>
  );
};
