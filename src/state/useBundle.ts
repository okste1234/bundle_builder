import { useContext } from 'react';
import { BundleContext, type BundleContextValue } from './bundleContextDefinition';

export function useBundle(): BundleContextValue {
  const ctx = useContext(BundleContext);
  if (!ctx) throw new Error('useBundle must be used within a BundleProvider');
  return ctx;
}
