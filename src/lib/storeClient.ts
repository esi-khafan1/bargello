import { getBrowserSupabase } from './supabase';
import { INITIAL_CATALOG_SNAPSHOT } from './seedSnapshot';
import type {
  CatalogSnapshot,
  CreateOrderPayload,
  OrderReceipt,
  Product,
  ProductReview,
  StoreSettings,
  SupportMessage,
  TrackedOrder,
} from './types';

export async function fetchCatalogSnapshot(): Promise<CatalogSnapshot> {
  try {
    const res = await fetch('/api/catalog', { cache: 'no-store' });
    const json = await res.json();
    if (!json.sandboxDirect && json.snapshot) {
      return json.snapshot as CatalogSnapshot;
    }
  } catch {
    // Fall through to browser Supabase client
  }

  const sb = getBrowserSupabase();
  if (!sb) {
    return INITIAL_CATALOG_SNAPSHOT;
  }

  try {
    const [catRes, brandRes, prodRes, setRes, revRes] = await Promise.all([
      sb
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      sb
        .from('brands_inspirations')
        .select('*')
        .order('name_fa', { ascending: true }),
      sb
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sales_count', { ascending: false }),
      sb.from('store_settings').select('*').eq('id', 1).single(),
      sb
        .from('product_reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false }),
    ]);

    if (prodRes.error || !prodRes.data) {
      return INITIAL_CATALOG_SNAPSHOT;
    }

    return {
      categories: catRes.data ?? INITIAL_CATALOG_SNAPSHOT.categories,
      brands: brandRes.data ?? INITIAL_CATALOG_SNAPSHOT.brands,
      products: prodRes.data as Product[],
      settings: (setRes.data as StoreSettings) ?? INITIAL_CATALOG_SNAPSHOT.settings,
      reviews: (revRes.data as ProductReview[]) ?? INITIAL_CATALOG_SNAPSHOT.reviews,
    };
  } catch {
    return INITIAL_CATALOG_SNAPSHOT;
  }
}

export async function submitStoreOrder(
  payload: CreateOrderPayload
): Promise<OrderReceipt> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();

  if (!json.sandboxDirect) {
    if (!res.ok || json.error) {
      throw new Error(json.error || 'خطا در ثبت سفارش');
    }
    return json.receipt as OrderReceipt;
  }

  const sb = getBrowserSupabase();
  if (!sb) {
    throw new Error('عدم دسترسی به دیتابیس سفارش‌ها');
  }

  const { data, error } = await sb.rpc('create_store_order', {
    p_customer_name: payload.customer_name,
    p_customer_phone: payload.customer_phone,
    p_province: payload.province,
    p_city: payload.city,
    p_address: payload.address,
    p_postal_code: payload.postal_code ?? '',
    p_notes: payload.notes ?? '',
    p_payment_method: payload.payment_method,
    p_receipt_reference: payload.receipt_reference ?? '',
    p_items: payload.items,
  });

  if (error) {
    throw new Error(error.message || 'خطا در ثبت سفارش');
  }

  return data as OrderReceipt;
}

export async function trackStoreOrder(
  orderCode: string,
  phone: string
): Promise<TrackedOrder | null> {
  const res = await fetch(
    `/api/orders?code=${encodeURIComponent(orderCode)}&phone=${encodeURIComponent(phone)}`,
    { cache: 'no-store' }
  );
  const json = await res.json();

  if (!json.sandboxDirect) {
    if (!res.ok || json.error) {
      throw new Error(json.error || 'خطا در پیگیری سفارش');
    }
    return (json.order as TrackedOrder | null) ?? null;
  }

  const sb = getBrowserSupabase();
  if (!sb) return null;

  const { data, error } = await sb.rpc('track_store_order', {
    p_order_code: orderCode,
    p_phone: phone,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data as TrackedOrder | null) ?? null;
}

export async function submitOrderReceiptCode(
  orderCode: string,
  phone: string,
  receiptReference: string
): Promise<boolean> {
  const res = await fetch('/api/orders', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_code: orderCode,
      phone,
      receipt_reference: receiptReference,
    }),
  });
  const json = await res.json();

  if (!json.sandboxDirect) {
    if (!res.ok || json.error) {
      throw new Error(json.error || 'خطا در ثبت کد پیگیری واریز');
    }
    return Boolean(json.ok);
  }

  const sb = getBrowserSupabase();
  if (!sb) return false;

  const { data, error } = await sb.rpc('submit_order_receipt', {
    p_order_code: orderCode,
    p_phone: phone,
    p_receipt_reference: receiptReference,
  });
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function incrementProductView(productId: string): Promise<void> {
  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'increment_view', product_id: productId }),
    });
    const json = await res.json();
    if (json.sandboxDirect) {
      const sb = getBrowserSupabase();
      if (sb) {
        await sb.rpc('increment_product_view', { p_product_id: productId });
      }
    }
  } catch {
    // Non-blocking view telemetry
  }
}

export async function submitProductReview(payload: {
  product_id: string;
  author_name: string;
  rating: number;
  comment: string;
}): Promise<ProductReview> {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();

  if (!json.sandboxDirect) {
    if (!res.ok || json.error) {
      throw new Error(json.error || 'خطا در ثبت دیدگاه');
    }
    return json.review as ProductReview;
  }

  const sb = getBrowserSupabase();
  if (!sb) throw new Error('عدم دسترسی به دیتابیس نظرات');

  const { data, error } = await sb
    .from('product_reviews')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as ProductReview;
}

export async function submitSupportMessage(payload: {
  full_name: string;
  phone: string;
  order_code?: string;
  subject: string;
  message: string;
}): Promise<void> {
  const res = await fetch('/api/support', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();

  if (!json.sandboxDirect) {
    if (!res.ok || json.error) {
      throw new Error(json.error || 'خطا در ارسال پیام');
    }
    return;
  }

  const sb = getBrowserSupabase();
  if (!sb) throw new Error('عدم دسترسی به دیتابیس');

  const { error } = await sb.from('support_messages').insert({
    full_name: payload.full_name,
    phone: payload.phone,
    order_code: payload.order_code || null,
    subject: payload.subject,
    message: payload.message,
  });
  if (error) throw new Error(error.message);
}

// Admin API calls (server-first, fallback to browser RPC authenticated via bcrypt passcode)
export async function verifyAdminPasscode(passcode: string): Promise<boolean> {
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'verify', passcode }),
  });
  const json = await res.json();
  if (!json.sandboxDirect) {
    return Boolean(json.valid);
  }
  const sb = getBrowserSupabase();
  if (!sb) return false;
  const { data } = await sb.rpc('verify_admin_passcode', {
    p_passcode: passcode,
  });
  return Boolean(data);
}

export interface AdminDashboardData {
  products: Product[];
  orders: TrackedOrder[];
  support_messages: SupportMessage[];
  settings: StoreSettings;
}

export async function fetchAdminDashboard(
  passcode: string
): Promise<AdminDashboardData> {
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'dashboard', passcode }),
  });
  const json = await res.json();
  if (!json.sandboxDirect) {
    if (!res.ok || json.error) {
      throw new Error(json.error || 'رمز مدیریت اشتباه است');
    }
    return json.dashboard as AdminDashboardData;
  }

  const sb = getBrowserSupabase();
  if (!sb) throw new Error('عدم دسترسی به دیتابیس');
  const { data, error } = await sb.rpc('admin_get_dashboard', {
    p_passcode: passcode,
  });
  if (error) throw new Error(error.message);
  return data as AdminDashboardData;
}

export async function adminUpsertProduct(
  passcode: string,
  product: Partial<Product>
): Promise<string> {
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'upsert_product', passcode, product }),
  });
  const json = await res.json();
  if (!json.sandboxDirect) {
    if (!res.ok || json.error) throw new Error(json.error);
    return json.productId as string;
  }
  const sb = getBrowserSupabase();
  if (!sb) throw new Error('عدم دسترسی به دیتابیس');
  const { data, error } = await sb.rpc('admin_upsert_product', {
    p_passcode: passcode,
    p_product: product,
  });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function adminDeleteProduct(
  passcode: string,
  productId: string
): Promise<void> {
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'delete_product',
      passcode,
      product_id: productId,
    }),
  });
  const json = await res.json();
  if (!json.sandboxDirect) {
    if (!res.ok || json.error) throw new Error(json.error);
    return;
  }
  const sb = getBrowserSupabase();
  if (!sb) throw new Error('عدم دسترسی به دیتابیس');
  const { error } = await sb.rpc('admin_delete_product', {
    p_passcode: passcode,
    p_product_id: productId,
  });
  if (error) throw new Error(error.message);
}

export async function adminUpdateOrder(
  passcode: string,
  orderId: string,
  paymentStatus: string,
  orderStatus: string,
  postalTrackingCode: string
): Promise<void> {
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'update_order',
      passcode,
      order_id: orderId,
      payment_status: paymentStatus,
      order_status: orderStatus,
      postal_tracking_code: postalTrackingCode,
    }),
  });
  const json = await res.json();
  if (!json.sandboxDirect) {
    if (!res.ok || json.error) throw new Error(json.error);
    return;
  }
  const sb = getBrowserSupabase();
  if (!sb) throw new Error('عدم دسترسی به دیتابیس');
  const { error } = await sb.rpc('admin_update_order', {
    p_passcode: passcode,
    p_order_id: orderId,
    p_payment_status: paymentStatus,
    p_order_status: orderStatus,
    p_postal_tracking_code: postalTrackingCode,
  });
  if (error) throw new Error(error.message);
}

export async function adminUpdateSettings(
  passcode: string,
  settings: Partial<StoreSettings>,
  newPasscode?: string
): Promise<void> {
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'update_settings',
      passcode,
      settings,
      new_passcode: newPasscode || null,
    }),
  });
  const json = await res.json();
  if (!json.sandboxDirect) {
    if (!res.ok || json.error) throw new Error(json.error);
    return;
  }
  const sb = getBrowserSupabase();
  if (!sb) throw new Error('عدم دسترسی به دیتابیس');
  const { error } = await sb.rpc('admin_update_store_settings', {
    p_passcode: passcode,
    p_settings: settings,
    p_new_passcode: newPasscode || null,
  });
  if (error) throw new Error(error.message);
}
