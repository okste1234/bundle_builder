import { AccordionStep } from './components/accordion/AccordionStep';
import { ProductCard } from './components/product/ProductCard';
import { PlanOptionCard } from './components/plan/PlanOptionCard';
import { useBundle } from './state/useBundle';
import { getSelectedProductCount } from './state/selectors';
import { plans, productsByCategory, steps } from './data/catalog';
import type { ProductCategory } from './types';

export function BundleBuilder() {
  const { state, toggleStep, openStep, setVariant, adjustQuantity, setPlan } = useBundle();

  return (
    <div className="flex w-full flex-col items-start gap-[13px]" aria-label="Bundle builder steps">
      {steps.map((step, index) => {
        const isOpen = state.openStepId === step.id;
        const nextStep = steps[index + 1];

        return (
          <AccordionStep
            key={step.id}
            stepId={step.id}
            stepNumber={step.stepNumber}
            totalSteps={steps.length}
            title={step.title}
            icon={step.icon}
            isOpen={isOpen}
            selectedCount={
              step.category === 'plan' ? undefined : getSelectedProductCount(state, step.category as ProductCategory)
            }
            onToggle={() => toggleStep(step.id)}
            nextLabel={step.nextLabel}
            onNext={() => (nextStep ? openStep(nextStep.id) : toggleStep(step.id))}
          >
            {step.category === 'plan' ? (
              <div role="radiogroup" aria-label="Choose your plan" className="flex w-full flex-col gap-[12px]">
                {plans.map((plan) => (
                  <PlanOptionCard
                    key={plan.id}
                    plan={plan}
                    isSelected={state.planId === plan.id}
                    onSelect={() => setPlan(plan.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex w-full flex-wrap justify-center gap-[15px]">
                {productsByCategory[step.category as ProductCategory].map((product) => (
                  <div key={product.id} className="w-full sm:w-[calc(50%-7.5px)]">
                    <ProductCard
                      product={product}
                      selection={state.products[product.id]}
                      onSelectVariant={(variantId) => setVariant(product.id, variantId)}
                      onIncrement={() =>
                        adjustQuantity(product.id, state.products[product.id]?.selectedVariantId ?? undefined, 1)
                      }
                      onDecrement={() =>
                        adjustQuantity(product.id, state.products[product.id]?.selectedVariantId ?? undefined, -1)
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </AccordionStep>
        );
      })}
    </div>
  );
}
