import type {
  CalculatedCartLine,
  CartCalculation,
  CartEntry,
  Product,
  StoreSettings,
} from './types';

export function calculateCartWithBogo(
  entries: CartEntry[],
  productsMap: Map<string, Product>,
  settings: StoreSettings
): CartCalculation {
  // Aggregate duplicate entries by productId
  const aggregated = new Map<string, number>();
  for (const entry of entries) {
    if (entry.quantity <= 0) continue;
    const prod = productsMap.get(entry.productId);
    if (!prod || !prod.is_active || prod.stock_count <= 0) continue;
    const cappedQty = Math.min(
      prod.stock_count,
      (aggregated.get(entry.productId) ?? 0) + entry.quantity
    );
    aggregated.set(entry.productId, cappedQty);
  }

  if (aggregated.size === 0) {
    return {
      lines: [],
      totalUnits: 0,
      totalBogoEligibleUnits: 0,
      totalFreeUnits: 0,
      unpairedBogoUnits: 0,
      subtotalToman: 0,
      bogoDiscountToman: 0,
      netAfterDiscountToman: 0,
      shippingToman: 0,
      amountToFreeShippingToman: settings.free_shipping_threshold_toman,
      payableTotalToman: 0,
    };
  }

  // Expand BOGO-eligible units sorted by price DESC, then productId ASC (identical to PostgreSQL RPC!)
  const expandedBogoUnits: { productId: string; price: number }[] = [];
  for (const [productId, qty] of aggregated.entries()) {
    const prod = productsMap.get(productId)!;
    if (settings.bogo_enabled && prod.is_bogo_eligible) {
      for (let i = 0; i < qty; i++) {
        expandedBogoUnits.push({ productId, price: prod.price_toman });
      }
    }
  }

  expandedBogoUnits.sort((a, b) => {
    if (b.price !== a.price) return b.price - a.price;
    return a.productId.localeCompare(b.productId);
  });

  // Every 2nd unit (1-based even position => 0-based index 1, 3, 5...) is 100% FREE
  const freeCountByProduct = new Map<string, number>();
  expandedBogoUnits.forEach((unit, index) => {
    if ((index + 1) % 2 === 0) {
      freeCountByProduct.set(
        unit.productId,
        (freeCountByProduct.get(unit.productId) ?? 0) + 1
      );
    }
  });

  const lines: CalculatedCartLine[] = [];
  let totalUnits = 0;
  let subtotalToman = 0;
  let bogoDiscountToman = 0;
  let totalFreeUnits = 0;

  for (const [productId, quantity] of aggregated.entries()) {
    const product = productsMap.get(productId)!;
    const freeQuantity = freeCountByProduct.get(productId) ?? 0;
    const paidQuantity = Math.max(0, quantity - freeQuantity);
    const unitPriceToman = product.price_toman;
    const lineSubtotalToman = quantity * unitPriceToman;
    const lineDiscountToman = freeQuantity * unitPriceToman;
    const linePayableToman = paidQuantity * unitPriceToman;

    lines.push({
      product,
      quantity,
      freeQuantity,
      paidQuantity,
      unitPriceToman,
      lineSubtotalToman,
      lineDiscountToman,
      linePayableToman,
    });

    totalUnits += quantity;
    subtotalToman += lineSubtotalToman;
    bogoDiscountToman += lineDiscountToman;
    totalFreeUnits += freeQuantity;
  }

  const totalBogoEligibleUnits = expandedBogoUnits.length;
  const unpairedBogoUnits = settings.bogo_enabled
    ? totalBogoEligibleUnits % 2
    : 0;
  const netAfterDiscountToman = Math.max(0, subtotalToman - bogoDiscountToman);

  const shippingToman =
    netAfterDiscountToman >= settings.free_shipping_threshold_toman
      ? 0
      : settings.shipping_cost_toman;

  const amountToFreeShippingToman = Math.max(
    0,
    settings.free_shipping_threshold_toman - netAfterDiscountToman
  );

  const payableTotalToman = netAfterDiscountToman + shippingToman;

  return {
    lines,
    totalUnits,
    totalBogoEligibleUnits,
    totalFreeUnits,
    unpairedBogoUnits,
    subtotalToman,
    bogoDiscountToman,
    netAfterDiscountToman,
    shippingToman,
    amountToFreeShippingToman,
    payableTotalToman,
  };
}
