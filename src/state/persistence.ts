import { DEFAULT_VARIANT_KEY, type BundleState, type ProductSelection } from '../types';
import { plansById, productsById, steps } from '../data/catalog';
import { MAX_QUANTITY, MIN_QUANTITY } from './bundleReducer';

export const STORAGE_KEY = 'bundle-builder:saved-system:v1';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeQuantities(raw: unknown): Record<string, number> {
  if (!isPlainObject(raw)) return {};
  const result: Record<string, number> = {};
  for (const [variantKey, value] of Object.entries(raw)) {
    const quantity = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(quantity)) continue;
    result[variantKey] = Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.round(quantity)));
  }
  return result;
}

function sanitizeProductSelection(productId: string, raw: unknown): ProductSelection | null {
  const product = productsById[productId];
  if (!product) return null;
  if (!isPlainObject(raw)) return null;

  const quantities = sanitizeQuantities(raw.quantities);
  const rawVariantId = raw.selectedVariantId;

  let selectedVariantId: string | null = null;
  if (product.variants?.length) {
    const validIds = new Set(product.variants.map((v) => v.id));
    selectedVariantId =
      typeof rawVariantId === 'string' && validIds.has(rawVariantId)
        ? rawVariantId
        : product.variants[0].id;
  }

  // Drop quantities for variant ids that no longer exist in the catalog (or, for a
  // variant-less product, anything that isn't the implicit default key).
  const allowedKeys = product.variants?.length
    ? new Set(product.variants.map((v) => v.id))
    : new Set([DEFAULT_VARIANT_KEY]);
  const cleanedQuantities: Record<string, number> = {};
  for (const [key, qty] of Object.entries(quantities)) {
    if (allowedKeys.has(key)) cleanedQuantities[key] = qty;
  }

  return { selectedVariantId, quantities: cleanedQuantities };
}

/** Defensively parses a saved bundle from localStorage. Returns null if the payload is
 *  missing, malformed, or doesn't resemble a saved bundle at all — callers should fall
 *  back to the app's normal initial state in that case rather than crashing. */
export function loadSavedBundle(): BundleState | null {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // localStorage can throw in private-browsing / disabled-storage contexts.
    return null;
  }
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isPlainObject(parsed)) return null;

  // A returning visit restores the shopper's *system* exactly (products, quantities,
  // variants, plan) — but the open accordion step is navigation state, not part of that
  // system. If they saved with every step collapsed (or with a stale/invalid step id from
  // an older catalog), land them on the first step rather than an all-collapsed accordion,
  // consistent with "Step 1 is open on load." Collapsing everything mid-session still works
  // exactly as before — this fallback only applies when hydrating from a saved payload.
  const validStepIds = new Set(steps.map((s) => s.id));
  const openStepId =
    typeof parsed.openStepId === 'string' && validStepIds.has(parsed.openStepId)
      ? parsed.openStepId
      : steps[0].id;

  const planId =
    typeof parsed.planId === 'string' && plansById[parsed.planId] ? parsed.planId : null;

  const products: Record<string, ProductSelection> = {};
  if (isPlainObject(parsed.products)) {
    for (const [productId, rawSelection] of Object.entries(parsed.products)) {
      const sanitized = sanitizeProductSelection(productId, rawSelection);
      if (sanitized) products[productId] = sanitized;
    }
  }

  // A payload with no recognizable product entries isn't a useful save — treat it as absent.
  if (Object.keys(products).length === 0) return null;

  return { openStepId, planId, products };
}

export function persistBundle(state: BundleState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearSavedBundle(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore — nothing to clean up if storage is unavailable.
  }
}

export function hasSavedBundle(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
