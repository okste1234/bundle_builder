import { createContext } from 'react';
import type { BundleState } from '../types';
import type { BundleAction } from './bundleReducer';

export interface BundleContextValue {
  state: BundleState;
  dispatch: React.Dispatch<BundleAction>;
  toggleStep: (stepId: string) => void;
  openStep: (stepId: string) => void;
  setVariant: (productId: string, variantId: string) => void;
  setQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  adjustQuantity: (productId: string, variantId: string | undefined, delta: number) => void;
  setPlan: (planId: string | null) => void;
  saveForLater: () => void;
  lastSavedAt: number | null;
}

export const BundleContext = createContext<BundleContextValue | null>(null);
