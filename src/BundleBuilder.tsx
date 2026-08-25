import { useEffect, useRef } from 'react';
import { AccordionStep } from './components/accordion/AccordionStep';
import { ProductCard } from './components/product/ProductCard';
import { PlanOptionCard } from './components/plan/PlanOptionCard';
import { useBundle } from './state/useBundle';
import { getSelectedProductCount } from './state/selectors';
import { plans, productsByCategory, steps } from './data/catalog';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import type { ProductCategory } from './types';

export function BundleBuilder() {
  const { state, toggleStep, openStep, setVariant, adjustQuantity, setPlan } = useBundle();
  const reducedMotion = usePrefersReducedMotion();
  const stepRefs = useRef<Record<string, HTMLElement | null>>({});
  const isFirstRender = useRef(true);

  // When a step opens (via header click or "Next"), bring it into view — but only if it
  // isn't already comfortably visible, so we never force an unnecessary jump.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const el = state.openStepId ? stepRefs.current[state.openStepId] : null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const headerHeight = 24;
    const fullyVisible = rect.top >= headerHeight && rect.bottom <= window.innerHeight;
    if (!fullyVisible) {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }, [state.openStepId, reducedMotion]);

  return (
    <div className="flex w-full flex-col items-start" aria-label="Bundle builder steps">
      {steps.map((step, index) => {
        const isOpen = state.openStepId === step.id;
        const nextStep = steps[index + 1];

        return (
          <AccordionStep
            key={step.id}
            ref={(el) => {
              stepRefs.current[step.id] = el;
            }}
            stepId={step.id}
            stepNumber={step.stepNumber}
            totalSteps={steps.length}
            title={step.title}
            icon={step.icon}
            isOpen={isOpen}
            isFirst={index === 0}
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
            <div className="grid w-full grid-cols-1 gap-[15px] xl:grid-cols-2 xl:items-stretch">
            {productsByCategory[step.category as ProductCategory].map((product) => (
              <div key={product.id} className="min-w-0 xl:last:odd:col-span-2 xl:last:odd:mx-auto xl:last:odd:w-[360px]">
                <ProductCard
                  product={product}
                  selection={state.products[product.id]}
                  onSelectVariant={(variantId) =>
                    setVariant(product.id, variantId)
                  }
                  onIncrement={() =>
                    adjustQuantity(
                      product.id,
                      state.products[product.id]?.selectedVariantId ?? undefined,
                      1,
                    )
                  }
                  onDecrement={() =>
                    adjustQuantity(
                      product.id,
                      state.products[product.id]?.selectedVariantId ?? undefined,
                      -1,
                    )
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
