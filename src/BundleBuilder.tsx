import { useLayoutEffect, useRef } from 'react';
import { AccordionStep, ACCORDION_TRANSITION_MS } from './components/accordion/AccordionStep';
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

  // When a step opens, the previously-open step's collapse can remove far more document
  // height than what's actually visible on screen (e.g. a 5-product step on mobile, most
  // of it already scrolled past). Since we never move the viewport ourselves, that
  // off-screen height loss would otherwise drag everything below it — including the step
  // that just opened — up past the viewport entirely, forcing the user to hunt for it.
  //
  // This does NOT scroll to a destination the way the old scrollIntoView effect did. It
  // continuously cancels *drift*: every frame, it measures how far the newly-open step has
  // moved on screen purely as a side effect of the collapse animating above it, and scrolls
  // by that same amount to hold it visually still. The step's own natural movement (from its
  // own content unfolding) isn't part of that drift, so it's untouched — only the borrowed
  // motion from the collapsing sibling gets cancelled. If the user starts scrolling by hand
  // mid-transition, correction stops immediately so it never fights a real gesture.
  useLayoutEffect(() => {
    const anchorEl = state.openStepId ? stepRefs.current[state.openStepId] : null;
    if (!anchorEl) return;

    const duration = reducedMotion ? 0 : ACCORDION_TRANSITION_MS;
    const start = performance.now();
    let lastTop = anchorEl.getBoundingClientRect().top;
    let rafId = 0;
    let userScrolled = false;

    const onUserScroll = () => {
      userScrolled = true;
    };
    window.addEventListener('wheel', onUserScroll, { passive: true });
    window.addEventListener('touchmove', onUserScroll, { passive: true });

    const tick = (now: number) => {
      if (userScrolled) return;

      const currentTop = anchorEl.getBoundingClientRect().top;
      const drift = currentTop - lastTop;
      if (drift !== 0) window.scrollBy(0, drift);
      lastTop = anchorEl.getBoundingClientRect().top;

      if (now - start < duration) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', onUserScroll);
      window.removeEventListener('touchmove', onUserScroll);
    };
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
              step.category === 'plan' ? (state.planId ? 1 : 0) : getSelectedProductCount(state, step.category as ProductCategory)
            }
            onToggle={() => toggleStep(step.id)}
            nextLabel={step.nextLabel}
            onNext={() => (nextStep ? openStep(nextStep.id) : toggleStep(step.id))}
          >
            {step.category === 'plan' ? (
              <div role="radiogroup" aria-label="Choose your plan" className="grid w-full grid-cols-1 gap-[12px] pt-[10px] sm:grid-cols-2 sm:items-stretch">
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
            // <div className="grid w-full grid-cols-1 gap-[15px] sm:grid-cols-2 sm:items-stretch">
            <div
              className="
                grid w-full grid-cols-1 gap-[15px]
                sm:grid-cols-2 sm:items-stretch
                lg:flex lg:flex-wrap lg:justify-center
                xl:grid xl:grid-cols-2 xl:items-stretch
              "
            >
              {productsByCategory[step.category as ProductCategory].map((product) => (
                <div
                  key={product.id}
                  className="
                    min-w-0

                    sm:last:odd:col-span-2
                    sm:last:odd:mx-auto
                    sm:last:odd:w-90

                    lg:flex-[1_1_190px]
                    lg:max-w-56
                    lg:first:last:max-w-none
                    lg:first:last:flex-none
                    lg:first:last:w-90
                    

                    xl:max-w-none
                    xl:w-auto
                    xl:flex-none
                    xl:last:odd:col-span-2
                    xl:last:odd:mx-auto
                    xl:last:odd:w-90
                  "
                >
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
