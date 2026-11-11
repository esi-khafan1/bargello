-- Bargello Perfume Iran E-Commerce Schema & RLS Policies
-- Synchronized with live Supabase project ceghlnyuziagatwqmfma (eu-central-1, Postgres 17)

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_fa text NOT NULL,
  name_en text NOT NULL,
  description_fa text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.brands_inspirations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_fa text NOT NULL,
  name_en text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  code text,
  name_fa text NOT NULL,
  name_en text NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  inspiration_brand_id uuid REFERENCES public.brands_inspirations(id) ON DELETE SET NULL,
  inspired_by_fa text,
  inspired_by_en text,
  collection_type text NOT NULL DEFAULT 'coded' CHECK (collection_type IN ('coded', 'niche', 'mystiq', 'body_mist', 'car_home')),
  gender text NOT NULL CHECK (gender IN ('men', 'women', 'unisex')),
  scent_family text NOT NULL CHECK (scent_family IN ('fresh', 'woody', 'oriental', 'floral')),
  scent_nature text NOT NULL,
  concentration text NOT NULL DEFAULT 'EDP',
  volume_ml integer NOT NULL DEFAULT 50,
  price_toman bigint NOT NULL CHECK (price_toman >= 0),
  compare_at_price_toman bigint,
  stock_count integer NOT NULL DEFAULT 0,
  is_bogo_eligible boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  sales_count integer NOT NULL DEFAULT 0,
  views_count integer NOT NULL DEFAULT 0,
  rating_avg numeric(3,2) NOT NULL DEFAULT 5.00,
  rating_count integer NOT NULL DEFAULT 1,
  top_notes_fa text[] NOT NULL DEFAULT '{}',
  heart_notes_fa text[] NOT NULL DEFAULT '{}',
  base_notes_fa text[] NOT NULL DEFAULT '{}',
  description_fa text NOT NULL DEFAULT '',
  bottle_tint text NOT NULL DEFAULT '#E8DFCA',
  image_url text,
  secondary_image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.store_settings (
  id integer PRIMARY KEY CHECK (id = 1),
  store_name_fa text NOT NULL,
  announcement_text_fa text NOT NULL,
  bogo_enabled boolean NOT NULL DEFAULT true,
  free_shipping_threshold_toman bigint NOT NULL DEFAULT 1800000,
  shipping_cost_toman bigint NOT NULL DEFAULT 85000,
  phone_number text NOT NULL DEFAULT '09337710035',
  whatsapp_number text NOT NULL DEFAULT '989337710035',
  instagram_handle text NOT NULL DEFAULT '@bargello.khouzestan',
  address_fa text NOT NULL,
  bank_card_number text NOT NULL,
  bank_card_holder text NOT NULL,
  zarinpal_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id integer PRIMARY KEY CHECK (id = 1),
  passcode_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  province text,
  city text,
  address text,
  postal_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  province text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  postal_code text,
  notes text,
  payment_method text NOT NULL CHECK (payment_method IN ('card_to_card', 'whatsapp', 'zarinpal')),
  payment_status text NOT NULL DEFAULT 'pending',
  order_status text NOT NULL DEFAULT 'pending_confirmation',
  receipt_reference text,
  postal_tracking_code text,
  subtotal_toman bigint NOT NULL,
  bogo_discount_toman bigint NOT NULL DEFAULT 0,
  shipping_toman bigint NOT NULL DEFAULT 0,
  payable_total_toman bigint NOT NULL,
  bogo_free_units integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name_fa text NOT NULL,
  product_code text,
  volume_ml integer NOT NULL DEFAULT 50,
  quantity integer NOT NULL CHECK (quantity > 0),
  free_quantity integer NOT NULL DEFAULT 0,
  unit_price_toman bigint NOT NULL,
  line_discount_toman bigint NOT NULL DEFAULT 0,
  line_total_toman bigint NOT NULL
);

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  order_code text,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands_inspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
