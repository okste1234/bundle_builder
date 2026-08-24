import { DEFAULT_VARIANT_KEY, type BundleState, type ProductSelection } from '../types';
import { productsById } from '../data/catalog';

export const MAX_QUANTITY = 10;
export const MIN_QUANTITY = 0;

export type BundleAction =
  | { type: 'OPEN_STEP'; stepId: string }
  | { type: 'TOGGLE_STEP'; stepId: string }
  | { type: 'SET_VARIANT'; productId: string; variantId: string }
  | { type: 'SET_QUANTITY'; productId: string; variantId?: string; quantity: number }
  | { type: 'ADJUST_QUANTITY'; productId: string; variantId?: string; delta: number }
  | { type: 'SET_PLAN'; planId: string | null }
  | { type: 'LOAD_STATE'; state: BundleState };

function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return MIN_QUANTITY;
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.round(value)));
}

function variantKeyFor(productId: string, requestedVariantId?: string): string {
  const product = productsById[productId];
  if (requestedVariantId) return requestedVariantId;
  if (product?.variants?.length) return product.variants[0].id;
  return DEFAULT_VARIANT_KEY;
}

function updateProduct(
  state: BundleState,
  productId: string,
  updater: (selection: ProductSelection) => ProductSelection,
): BundleState {
  const current: ProductSelection = state.products[productId] ?? {
    selectedVariantId: productsById[productId]?.variants?.length ? null : null,
    quantities: {},
  };
  return {
    ...state,
    products: {
      ...state.products,
      [productId]: updater(current),
    },
  };
}

export function bundleReducer(state: BundleState, action: BundleAction): BundleState {
  switch (action.type) {
    case 'OPEN_STEP':
      return { ...state, openStepId: action.stepId };

    case 'TOGGLE_STEP':
      return { ...state, openStepId: state.openStepId === action.stepId ? null : action.stepId };

    case 'SET_VARIANT':
      return updateProduct(state, action.productId, (selection) => ({
        ...selection,
        selectedVariantId: action.variantId,
        // Ensure the newly-selected variant has an explicit (possibly zero) entry so the
        // stepper has something to render, without ever touching other variants' quantities.
        quantities:
          action.variantId in selection.quantities
            ? selection.quantities
            : { ...selection.quantities, [action.variantId]: 0 },
      }));

    case 'SET_QUANTITY': {
      const variantKey = variantKeyFor(action.productId, action.variantId);
      return updateProduct(state, action.productId, (selection) => ({
        ...selection,
        quantities: {
          ...selection.quantities,
          [variantKey]: clampQuantity(action.quantity),
        },
      }));
    }

    case 'ADJUST_QUANTITY': {
      const variantKey = variantKeyFor(action.productId, action.variantId);
      return updateProduct(state, action.productId, (selection) => {
        const current = selection.quantities[variantKey] ?? 0;
        return {
          ...selection,
          quantities: {
            ...selection.quantities,
            [variantKey]: clampQuantity(current + action.delta),
          },
        };
      });
    }

    case 'SET_PLAN':
      return { ...state, planId: action.planId };

    case 'LOAD_STATE':
      return action.state;

    default:
      return state;
  }
}
