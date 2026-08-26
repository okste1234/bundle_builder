import { useEffect, useRef } from 'react';
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
  // Tracks the previously-seen openStepId (not "have we rendered before") so the effect
  // below is inherently safe to run more than once for the same step — including React
  // Strict Mode's intentional dev-mode double-invocation of effects on mount, which a
  // plain "isFirstRender" boolean flag doesn't survive (the ref persists across both
  // invocations, so the flag flips to false after the first one and no longer guards
  // anything on the second).
  const prevOpenStepId = useRef(state.openStepId);

  // When a step opens (via header click or "Next"), bring it into view — but only if its
  // top edge isn't already sensibly positioned, so we never force an unnecessary jump.
  // Opening one step also collapses whichever step was previously open, and both animate
  // over ACCORDION_TRANSITION_MS — measuring immediately would read the *pre-collapse*
  // layout (the old step still full-height), scrolling to a position that's stale the
  // instant the collapse animation actually plays out and everything shifts up underneath
  // it. Waiting for the transition to settle first means we measure the real, final
  // position.
  //
  // Two deliberate choices here, both to avoid over-aggressive repositioning:
  // - The visibility check only looks at the step's *top* edge, not whether the whole
  //   section fits in the viewport. An opened step can legitimately be taller than the
  //   screen (5 product cards on mobile) — requiring the entire thing to fit would treat
  //   that as "not visible" and force a scroll every time, even when the header (the part
  //   that actually matters for orientation) is already positioned fine.
  // - `block: 'nearest'` instead of `block: 'start'` — `'start'` unconditionally pins the
  //   step's top edge to the very top of the viewport, which can push its own header (and
  //   the cards just below it) up out of view. `'nearest'` only moves the element the
  //   minimum distance needed to bring it into a reasonable position.
  useEffect(() => {
    const openStepChanged = prevOpenStepId.current !== state.openStepId;
    prevOpenStepId.current = state.openStepId;
    if (!openStepChanged) return;

    const delay = reducedMotion ? 0 : ACCORDION_TRANSITION_MS;
    const timeoutId = window.setTimeout(() => {
      const el = state.openStepId ? stepRefs.current[state.openStepId] : null;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const topOffset = 24;
      const bottomOffset = 32;
      const isAboveViewport = rect.top < topOffset;
      const isBelowViewport = rect.top > window.innerHeight - bottomOffset;

      if (isAboveViewport || isBelowViewport) {
        el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
      }
    }, delay);

    return () => window.clearTimeout(timeoutId);
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
