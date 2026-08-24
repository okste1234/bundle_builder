import { DEFAULT_VARIANT_KEY, type BundleState, type BundleTotals, type ProductCategory, type ReviewLineItem } from '../types';
import { financing, plansById, productsByCategory, productsById, shipping } from '../data/catalog';

function lineItemsForProduct(productId: string, state: BundleState): ReviewLineItem[] {
  const product = productsById[productId];
  const selection = state.products[productId];
  if (!product || !selection) return [];

  return Object.entries(selection.quantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([variantId, quantity]) => {
      const variant = product.variants?.find((v) => v.id === variantId);
      return {
        key: `${productId}:${variantId}`,
        productId,
        variantId,
        category: product.category,
        name: product.name,
        variantLabel: variant?.label,
        image: variant?.swatchImage ?? product.image,
        quantity,
        unitPrice: product.price,
        compareAtUnitPrice: product.compareAtPrice,
        required: product.required,
      } satisfies ReviewLineItem;
    });
}

/** All selected (product, variant) line items across every category, in catalog order. */
export function getAllLineItems(state: BundleState): ReviewLineItem[] {
  return Object.keys(state.products).flatMap((productId) => lineItemsForProduct(productId, state));
}

export function getLineItemsForCategory(state: BundleState, category: ProductCategory): ReviewLineItem[] {
  return productsByCategory[category].flatMap((product) => lineItemsForProduct(product.id, state));
}

/** Distinct products (not variant-lines) with at least one unit selected — used for the
 *  accordion header's "N selected" count. */
export function getSelectedProductCount(state: BundleState, category: ProductCategory): number {
  return productsByCategory[category].filter((product) => {
    const selection = state.products[product.id];
    if (!selection) return false;
    return Object.values(selection.quantities).some((qty) => qty > 0);
  }).length;
}

/** Quantity for a specific variant, or — if `variantId` is omitted — for whichever
 *  variant is currently selected on the product card (falling back to the first
 *  variant, or the implicit default key for variant-less products). */
export function getQuantityFor(state: BundleState, productId: string, variantId?: string): number {
  const product = productsById[productId];
  const selection = state.products[productId];
  if (!selection) return 0;

  let key = variantId;
  if (!key) {
    if (product?.variants?.length) {
      key = selection.selectedVariantId ?? product.variants[0].id;
    } else {
      key = DEFAULT_VARIANT_KEY;
    }
  }
  return selection.quantities[key] ?? 0;
}

export function getTotals(state: BundleState): BundleTotals {
  const lineItems = getAllLineItems(state);

  let currentTotal = lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  let compareAtTotal = lineItems.reduce(
    (sum, item) => sum + (item.compareAtUnitPrice ?? item.unitPrice) * item.quantity,
    0,
  );

  const plan = state.planId ? plansById[state.planId] : null;
  if (plan) {
    currentTotal += plan.price;
    compareAtTotal += plan.compareAtPrice ?? plan.price;
  }

  currentTotal += shipping.price;
  compareAtTotal += shipping.compareAtPrice ?? shipping.price;

  const savings = Math.max(0, compareAtTotal - currentTotal);
  const financingPerMonth = financing.termMonths > 0 ? currentTotal / financing.termMonths : currentTotal;

  return {
    currentTotal: round2(currentTotal),
    compareAtTotal: round2(compareAtTotal),
    savings: round2(savings),
    financingPerMonth: round2(financingPerMonth),
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
