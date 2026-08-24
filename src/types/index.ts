/** Category a product belongs to — matches an accordion step 1:1, except "plan" which
 *  is modeled separately (single-select, no quantity/variants). */
export type ProductCategory = 'camera' | 'sensor' | 'accessory';

export interface Variant {
  id: string;
  label: string;
  swatchImage: string;
}

export interface Product {
  id: string;
  category: ProductCategory;
  name: string;
  description: string;
  learnMoreHref?: string;
  /** Hero image shown on the product card. Constant across variants unless a
   *  variant has no independent hero shot, in which case this is the default variant's photo. */
  image: string;
  /** Current unit price. */
  price: number;
  /** Original unit price, if this product is discounted. */
  compareAtPrice?: number;
  /** e.g. "Save 22%" */
  discountLabel?: string;
  variants?: Variant[];
  /** Fixed-quantity item that cannot be adjusted or removed (e.g. a required hub). */
  required?: boolean;
}

export interface Plan {
  id: string;
  name: string;
  /** If set, this suffix of `name` is rendered in the brand color (e.g. "Cam " + "Unlimited"). */
  nameAccent?: string;
  description: string;
  icon: string;
  price: number;
  compareAtPrice?: number;
}

export interface ShippingInfo {
  label: string;
  icon: string;
  price: number;
  compareAtPrice?: number;
}

export interface GuaranteeInfo {
  image: string;
  label: string;
}

export interface FinancingInfo {
  prefixLabel: string;
  termMonths: number;
}

export type StepCategory = ProductCategory | 'plan';

export interface StepConfig {
  id: string;
  stepNumber: number;
  title: string;
  icon: string;
  category: StepCategory;
  nextLabel: string;
}

/** Per-product selection: which variant is currently shown on the card, and the
 *  independent quantity held for every variant the user has ever set (or a single
 *  "default" key for products without variants). Switching `selectedVariantId` never
 *  mutates `quantities` — that's what keeps variant quantities independent. */
export interface ProductSelection {
  selectedVariantId: string | null;
  quantities: Record<string, number>;
}

export const DEFAULT_VARIANT_KEY = 'default';

export interface BundleState {
  openStepId: string | null;
  planId: string | null;
  products: Record<string, ProductSelection>;
}

/** A single resolved row in the review panel — one per (product, variant) pair with qty > 0. */
export interface ReviewLineItem {
  key: string;
  productId: string;
  variantId: string;
  category: ProductCategory;
  name: string;
  variantLabel?: string;
  image: string;
  quantity: number;
  unitPrice: number;
  compareAtUnitPrice?: number;
  required?: boolean;
}

export interface BundleTotals {
  currentTotal: number;
  compareAtTotal: number;
  savings: number;
  financingPerMonth: number;
}
