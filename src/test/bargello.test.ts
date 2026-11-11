import { describe, expect, it } from 'vitest';
import { calculateCartWithBogo } from '../lib/bogoEngine';
import { filterAndSortProducts } from '../lib/catalogFilter';
import { formatToman, normalizeDigits, toPersianDigits } from '../lib/format';
import { INITIAL_CATALOG_SNAPSHOT } from '../lib/seedSnapshot';
import type { Product } from '../lib/types';

describe('Bargello 1+1 BOGO Cart Engine', () => {
  const productsMap = new Map<string, Product>(
    INITIAL_CATALOG_SNAPSHOT.products.map((p) => [p.id, p])
  );
  const settings = INITIAL_CATALOG_SNAPSHOT.settings;

  const code561 = INITIAL_CATALOG_SNAPSHOT.products.find(
    (p) => p.code === '561'
  )!;
  const code122 = INITIAL_CATALOG_SNAPSHOT.products.find(
    (p) => p.code === '122'
  )!;
  const code199 = INITIAL_CATALOG_SNAPSHOT.products.find(
    (p) => p.code === '199'
  )!; // 1,050,000 Toman
  const nicheItem = INITIAL_CATALOG_SNAPSHOT.products.find(
    (p) => p.slug === 'bargello-niche-infinity-soleil-dor-100ml'
  )!; // is_bogo_eligible = false

  it('flags 1 unpaired unit when only a single coded perfume is in the cart', () => {
    const calc = calculateCartWithBogo(
      [{ productId: code561.id, quantity: 1 }],
      productsMap,
      settings
    );
    expect(calc.subtotalToman).toBe(980000);
    expect(calc.bogoDiscountToman).toBe(0);
    expect(calc.totalFreeUnits).toBe(0);
    expect(calc.unpairedBogoUnits).toBe(1);
    expect(calc.shippingToman).toBe(85000);
    expect(calc.payableTotalToman).toBe(1065000);
  });

  it('applies 100% discount on the 2nd coded bottle in a 1+1 pair', () => {
    const calc = calculateCartWithBogo(
      [
        { productId: code561.id, quantity: 1 },
        { productId: code122.id, quantity: 1 },
      ],
      productsMap,
      settings
    );
    expect(calc.subtotalToman).toBe(1960000);
    expect(calc.bogoDiscountToman).toBe(980000);
    expect(calc.totalFreeUnits).toBe(1);
    expect(calc.unpairedBogoUnits).toBe(0);
    expect(calc.shippingToman).toBe(85000);
    expect(calc.payableTotalToman).toBe(1065000);
  });

  it('discounts the lower-priced coded bottle when prices differ and scales to 4 bottles (2 free)', () => {
    const calc = calculateCartWithBogo(
      [
        { productId: code199.id, quantity: 2 }, // 2 x 1,050,000
        { productId: code561.id, quantity: 2 }, // 2 x 980,000
      ],
      productsMap,
      settings
    );
    expect(calc.totalFreeUnits).toBe(2);
    expect(calc.bogoDiscountToman).toBe(1050000 + 980000);
    expect(calc.shippingToman).toBe(0);
    expect(calc.payableTotalToman).toBe(2030000);
  });

  it('never applies 1+1 discount to Niche / non-eligible items', () => {
    const calc = calculateCartWithBogo(
      [{ productId: nicheItem.id, quantity: 2 }],
      productsMap,
      settings
    );
    expect(calc.totalFreeUnits).toBe(0);
    expect(calc.bogoDiscountToman).toBe(0);
    expect(calc.shippingToman).toBe(0);
    expect(calc.payableTotalToman).toBe(nicheItem.price_toman * 2);
  });

  it('disables 1+1 discount cleanly when bogo_enabled is turned off in admin settings', () => {
    const calc = calculateCartWithBogo(
      [
        { productId: code561.id, quantity: 1 },
        { productId: code122.id, quantity: 1 },
      ],
      productsMap,
      { ...settings, bogo_enabled: false }
    );
    expect(calc.bogoDiscountToman).toBe(0);
    expect(calc.totalFreeUnits).toBe(0);
  });
});

describe('Persian Digit Normalization & Catalog Code/Brand Search', () => {
  const { products, categories, brands } = INITIAL_CATALOG_SNAPSHOT;

  it('converts Persian and Arabic-Indic numerals accurately', () => {
    expect(normalizeDigits('کد ۵۶۱')).toBe('کد 561');
    expect(normalizeDigits('٠٩٣٣٧٧١٠٠٣٥')).toBe('09337710035');
    expect(toPersianDigits(561)).toBe('۵۶۱');
    expect(formatToman(980000)).toContain('تومان');
  });

  it('finds Bargello Code 561 using either Persian digits (۵۶۱) or English digits (561)', () => {
    const resFa = filterAndSortProducts(
      products,
      categories,
      { query: '۵۶۱' },
      brands
    );
    const resEn = filterAndSortProducts(
      products,
      categories,
      { query: '561' },
      brands
    );
    expect(resFa.length).toBeGreaterThanOrEqual(1);
    expect(resFa[0].code).toBe('561');
    expect(resEn[0].id).toBe(resFa[0].id);
  });

  it('finds perfumes by global designer brand inspiration (Dior Sauvage & Baccarat)', () => {
    const dior = filterAndSortProducts(
      products,
      categories,
      { query: 'Dior Sauvage' },
      brands
    );
    expect(dior.some((p) => p.code === '561')).toBe(true);

    const baccarat = filterAndSortProducts(
      products,
      categories,
      { query: 'باکارات' },
      brands
    );
    expect(baccarat.some((p) => p.code === '199')).toBe(true);
  });

  it('filters out-of-stock products when onlyInStock is enabled', () => {
    const modifiedProducts: Product[] = products.map((p) =>
      p.code === '226' ? { ...p, stock_count: 0 } : p
    );
    const inStockOnly = filterAndSortProducts(
      modifiedProducts,
      categories,
      { onlyInStock: true },
      brands
    );
    expect(inStockOnly.every((p) => p.stock_count > 0)).toBe(true);
    expect(inStockOnly.some((p) => p.code === '226')).toBe(false);
  });
});
