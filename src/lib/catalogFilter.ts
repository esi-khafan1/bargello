import { normalizeDigits } from './format';
import type { BrandInspiration, Category, Product, ScentFamily } from './types';

export type SortMode =
  | 'most_purchased'
  | 'most_viewed'
  | 'newest'
  | 'price_asc'
  | 'price_desc';

export interface ProductFilterOptions {
  query?: string;
  categorySlug?: string;
  gender?: 'all' | 'men' | 'women' | 'unisex';
  scentFamily?: 'all' | ScentFamily;
  scentNatureKeyword?: string;
  brandSlug?: string;
  onlyInStock?: boolean;
  onlyBogo?: boolean;
  sort?: SortMode;
}

export function filterAndSortProducts(
  products: Product[],
  categories: Category[],
  options: ProductFilterOptions,
  brands: BrandInspiration[] = []
): Product[] {
  const {
    query = '',
    categorySlug = 'all',
    gender = 'all',
    scentFamily = 'all',
    scentNatureKeyword = 'all',
    brandSlug = 'all',
    onlyInStock = false,
    onlyBogo = false,
    sort = 'most_purchased',
  } = options;

  const normalizedQuery = normalizeDigits(query).trim().toLowerCase();

  let targetCategoryId: string | null = null;
  if (categorySlug && categorySlug !== 'all') {
    const foundCat = categories.find((c) => c.slug === categorySlug);
    targetCategoryId = foundCat ? foundCat.id : '__none__';
  }

  let targetBrandId: string | null = null;
  if (brandSlug && brandSlug !== 'all') {
    const foundBrand = brands.find(
      (b) =>
        b.slug.toLowerCase() === brandSlug.toLowerCase() ||
        b.name_en.toLowerCase() === brandSlug.toLowerCase()
    );
    targetBrandId = foundBrand ? foundBrand.id : '__none__';
  }

  const filtered = products.filter((p) => {
    if (!p.is_active) return false;

    if (targetCategoryId && p.category_id !== targetCategoryId) {
      return false;
    }

    if (gender !== 'all' && p.gender !== gender) {
      return false;
    }

    if (scentFamily !== 'all' && p.scent_family !== scentFamily) {
      return false;
    }

    if (
      scentNatureKeyword !== 'all' &&
      !p.scent_nature.includes(scentNatureKeyword)
    ) {
      return false;
    }

    if (targetBrandId && p.inspiration_brand_id !== targetBrandId) {
      return false;
    }

    if (onlyInStock && p.stock_count <= 0) {
      return false;
    }

    if (onlyBogo && !p.is_bogo_eligible) {
      return false;
    }

    if (normalizedQuery) {
      const searchable = normalizeDigits(
        [
          p.code ?? '',
          p.name_fa,
          p.name_en,
          p.inspired_by_fa ?? '',
          p.inspired_by_en ?? '',
          p.scent_nature,
          p.scent_family,
          ...(p.top_notes_fa ?? []),
          ...(p.heart_notes_fa ?? []),
          ...(p.base_notes_fa ?? []),
        ].join(' ')
      ).toLowerCase();

      const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
      for (const token of tokens) {
        if (!searchable.includes(token)) {
          return false;
        }
      }
    }

    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    if (sort !== 'price_asc' && sort !== 'price_desc') {
      const aStock = a.stock_count > 0 ? 1 : 0;
      const bStock = b.stock_count > 0 ? 1 : 0;
      if (aStock !== bStock) return bStock - aStock;
    }

    switch (sort) {
      case 'most_purchased':
        return b.sales_count - a.sales_count;
      case 'most_viewed':
        return b.views_count - a.views_count;
      case 'newest': {
        if (a.is_new !== b.is_new) return a.is_new ? -1 : 1;
        return b.sales_count - a.sales_count;
      }
      case 'price_asc':
        return a.price_toman - b.price_toman;
      case 'price_desc':
        return b.price_toman - a.price_toman;
      default:
        return b.sales_count - a.sales_count;
    }
  });

  return sorted;
}
