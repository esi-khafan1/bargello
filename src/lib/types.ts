export type CollectionType =
  | 'coded'
  | 'niche'
  | 'mystiq'
  | 'body_mist'
  | 'car_home';

export type GenderType = 'men' | 'women' | 'unisex';
export type ScentFamily = 'fresh' | 'woody' | 'oriental' | 'floral';

export interface Category {
  id: string;
  slug: string;
  name_fa: string;
  name_en: string;
  description_fa: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface BrandInspiration {
  id: string;
  slug: string;
  name_fa: string;
  name_en: string;
}

export interface Product {
  id: string;
  slug: string;
  code: string | null;
  name_fa: string;
  name_en: string;
  category_id: string | null;
  inspiration_brand_id: string | null;
  inspired_by_fa: string | null;
  inspired_by_en: string | null;
  collection_type: CollectionType;
  gender: GenderType;
  scent_family: ScentFamily;
  scent_nature: string;
  concentration: string;
  volume_ml: number;
  price_toman: number;
  compare_at_price_toman: number | null;
  stock_count: number;
  is_bogo_eligible: boolean;
  is_featured: boolean;
  is_new: boolean;
  sales_count: number;
  views_count: number;
  rating_avg: number;
  rating_count: number;
  top_notes_fa: string[];
  heart_notes_fa: string[];
  base_notes_fa: string[];
  description_fa: string;
  bottle_tint: string;
  image_url: string | null;
  secondary_image_url: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface StoreSettings {
  id: number;
  store_name_fa: string;
  announcement_text_fa: string;
  bogo_enabled: boolean;
  free_shipping_threshold_toman: number;
  shipping_cost_toman: number;
  phone_number: string;
  whatsapp_number: string;
  instagram_handle: string;
  address_fa: string;
  bank_card_number: string;
  bank_card_holder: string;
  zarinpal_enabled: boolean;
}

export interface ProductReview {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CartEntry {
  productId: string;
  quantity: number;
}

export interface CalculatedCartLine {
  product: Product;
  quantity: number;
  freeQuantity: number;
  paidQuantity: number;
  unitPriceToman: number;
  lineSubtotalToman: number;
  lineDiscountToman: number;
  linePayableToman: number;
}

export interface CartCalculation {
  lines: CalculatedCartLine[];
  totalUnits: number;
  totalBogoEligibleUnits: number;
  totalFreeUnits: number;
  unpairedBogoUnits: number; // 1 when customer can add 1 more coded perfume for FREE!
  subtotalToman: number;
  bogoDiscountToman: number;
  netAfterDiscountToman: number;
  shippingToman: number;
  amountToFreeShippingToman: number;
  payableTotalToman: number;
}

export type PaymentMethod = 'card_to_card' | 'whatsapp' | 'zarinpal';

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  province: string;
  city: string;
  address: string;
  postal_code: string;
  notes: string;
  payment_method: PaymentMethod;
  receipt_reference?: string;
  items: { product_id: string; quantity: number }[];
}

export interface OrderReceipt {
  order_id: string;
  order_code: string;
  subtotal_toman: number;
  bogo_discount_toman: number;
  shipping_toman: number;
  payable_total_toman: number;
  bogo_free_units: number;
  payment_method: PaymentMethod;
  payment_status: string;
  order_status: string;
  created_at: string;
}

export interface TrackedOrderItem {
  id: string;
  product_name_fa: string;
  product_code: string | null;
  volume_ml: number;
  quantity: number;
  free_quantity: number;
  unit_price_toman: number;
  line_discount_toman: number;
  line_total_toman: number;
}

export interface TrackedOrder {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  province: string;
  city: string;
  address: string;
  postal_code?: string;
  notes?: string;
  payment_method: PaymentMethod;
  payment_status: 'pending' | 'receipt_submitted' | 'paid' | 'failed';
  order_status:
    | 'pending_confirmation'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  receipt_reference: string | null;
  postal_tracking_code: string | null;
  subtotal_toman: number;
  bogo_discount_toman: number;
  shipping_toman: number;
  payable_total_toman: number;
  bogo_free_units: number;
  created_at: string;
  items: TrackedOrderItem[];
}

export interface SupportMessage {
  id: string;
  full_name: string;
  phone: string;
  order_code: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export interface CatalogSnapshot {
  categories: Category[];
  brands: BrandInspiration[];
  products: Product[];
  settings: StoreSettings;
  reviews: ProductReview[];
}
