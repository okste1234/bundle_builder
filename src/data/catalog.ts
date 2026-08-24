import stepsJson from '../../data/steps.json';
import camerasJson from '../../data/cameras.json';
import sensorsJson from '../../data/sensors.json';
import accessoriesJson from '../../data/accessories.json';
import plansJson from '../../data/plans.json';
import shippingJson from '../../data/shipping.json';
import guaranteeJson from '../../data/guarantee.json';
import financingJson from '../../data/financing.json';
import initialSelectionsJson from '../../data/initialSelections.json';

import type {
  BundleState,
  FinancingInfo,
  GuaranteeInfo,
  Plan,
  Product,
  ShippingInfo,
  StepConfig,
} from '../types';

export const steps: StepConfig[] = stepsJson as StepConfig[];
export const cameras: Product[] = camerasJson as Product[];
export const sensors: Product[] = sensorsJson as Product[];
export const accessories: Product[] = accessoriesJson as Product[];
export const plans: Plan[] = plansJson as Plan[];
export const shipping: ShippingInfo = shippingJson as ShippingInfo;
export const guarantee: GuaranteeInfo = guaranteeJson as GuaranteeInfo;
export const financing: FinancingInfo = financingJson as FinancingInfo;
export const initialSelections: BundleState = initialSelectionsJson as BundleState;

export const allProducts: Product[] = [...cameras, ...sensors, ...accessories];

export const productsById: Record<string, Product> = Object.fromEntries(
  allProducts.map((product) => [product.id, product]),
);

export const plansById: Record<string, Plan> = Object.fromEntries(
  plans.map((plan) => [plan.id, plan]),
);

export const productsByCategory = {
  camera: cameras,
  sensor: sensors,
  accessory: accessories,
} as const;
