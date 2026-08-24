import { useCallback, useMemo, useReducer, useState, type ReactNode } from 'react';
import type { BundleState } from '../types';
import { bundleReducer } from './bundleReducer';
import { initialSelections } from '../data/catalog';
import { loadSavedBundle, persistBundle } from './persistence';
import { BundleContext } from './bundleContextDefinition';

function initState(): BundleState {
  return loadSavedBundle() ?? initialSelections;
}

export function BundleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bundleReducer, undefined, initState);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const toggleStep = useCallback((stepId: string) => dispatch({ type: 'TOGGLE_STEP', stepId }), []);
  const openStep = useCallback((stepId: string) => dispatch({ type: 'OPEN_STEP', stepId }), []);
  const setVariant = useCallback(
    (productId: string, variantId: string) => dispatch({ type: 'SET_VARIANT', productId, variantId }),
    [],
  );
  const setQuantity = useCallback(
    (productId: string, variantId: string | undefined, quantity: number) =>
      dispatch({ type: 'SET_QUANTITY', productId, variantId, quantity }),
    [],
  );
  const adjustQuantity = useCallback(
    (productId: string, variantId: string | undefined, delta: number) =>
      dispatch({ type: 'ADJUST_QUANTITY', productId, variantId, delta }),
    [],
  );
  const setPlan = useCallback((planId: string | null) => dispatch({ type: 'SET_PLAN', planId }), []);

  const saveForLater = useCallback(() => {
    const ok = persistBundle(state);
    if (ok) setLastSavedAt(Date.now());
  }, [state]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      toggleStep,
      openStep,
      setVariant,
      setQuantity,
      adjustQuantity,
      setPlan,
      saveForLater,
      lastSavedAt,
    }),
    [state, toggleStep, openStep, setVariant, setQuantity, adjustQuantity, setPlan, saveForLater, lastSavedAt],
  );

  return <BundleContext.Provider value={value}>{children}</BundleContext.Provider>;
}
