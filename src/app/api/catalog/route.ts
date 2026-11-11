import { NextResponse } from 'next/server';
import {
  createServerSupabase,
  isServerSupabaseKnownBlocked,
} from '@/lib/supabase';
import { INITIAL_CATALOG_SNAPSHOT } from '@/lib/seedSnapshot';

export async function GET() {
  if (isServerSupabaseKnownBlocked()) {
    return NextResponse.json({
      sandboxDirect: true,
      fallback: INITIAL_CATALOG_SNAPSHOT,
    });
  }

  const supabase = createServerSupabase();
  if (!supabase) {
    return NextResponse.json({
      sandboxDirect: true,
      fallback: INITIAL_CATALOG_SNAPSHOT,
    });
  }

  try {
    const [catRes, brandRes, prodRes, setRes, revRes] = await Promise.all([
      supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('brands_inspirations')
        .select('*')
        .order('name_fa', { ascending: true }),
      supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('sales_count', { ascending: false }),
      supabase.from('store_settings').select('*').eq('id', 1).single(),
      supabase
        .from('product_reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false }),
    ]);

    if (prodRes.error) {
      throw prodRes.error;
    }

    return NextResponse.json({
      sandboxDirect: false,
      snapshot: {
        categories: catRes.data ?? INITIAL_CATALOG_SNAPSHOT.categories,
        brands: brandRes.data ?? INITIAL_CATALOG_SNAPSHOT.brands,
        products: prodRes.data ?? INITIAL_CATALOG_SNAPSHOT.products,
        settings: setRes.data ?? INITIAL_CATALOG_SNAPSHOT.settings,
        reviews: revRes.data ?? INITIAL_CATALOG_SNAPSHOT.reviews,
      },
    });
  } catch {
    return NextResponse.json({
      sandboxDirect: true,
      fallback: INITIAL_CATALOG_SNAPSHOT,
    });
  }
}
