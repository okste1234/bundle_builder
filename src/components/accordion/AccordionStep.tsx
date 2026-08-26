import { forwardRef, type ReactNode } from 'react';
import { Collapse } from '../shared/Collapse';

// Single source of truth for how long the accordion's open/close collapse animation takes.
// Also read by BundleBuilder's scroll-compensation effect, which needs to keep counteracting
// drift for exactly as long as the collapse is actually animating.
export const ACCORDION_TRANSITION_MS = 380;

interface AccordionStepProps {
  stepId: string;
  stepNumber: number;
  totalSteps: number;
  title: string;
  icon: string;
  isOpen: boolean;
  /** The first step never gets top spacing — there's nothing above it to separate from. */
  isFirst?: boolean;
  selectedCount?: number;
  onToggle: () => void;
  nextLabel: string;
  onNext: () => void;
  children: ReactNode;
}

export const AccordionStep = forwardRef<HTMLElement, AccordionStepProps>(function AccordionStep(
  { stepId, stepNumber, totalSteps, title, icon, isOpen, isFirst = false, selectedCount, onToggle, nextLabel, onNext, children },
  ref,
) {
  const panelId = `step-panel-${stepId}`;
  const headerId = `step-header-${stepId}`;

  // Steps are spaced apart with margin (not a parent `gap`) so that an *open* step can
  // collapse the space above itself to zero — its "Step X of 4" label should sit flush
  // against the previous step's divider line, not float below a visible gap. A closed
  // step keeps the normal breathing room from whatever's above it.
  const topSpacingClass = isFirst || isOpen ? ' ' : 'mt-[6px] md:mt-[13px]';
  const roundedClass = isFirst ? 'md:rounded-[10px]' : 'md:rounded-b-[10px]';

  return (
    <section
      ref={ref}
      className={`flex w-full flex-col items-start ${roundedClass} transition-[background-color] duration-300 ease-out ${topSpacingClass} ${
        isOpen ? 'bg-surface-tint pt-[15px]' : 'bg-transparent pt-0'
      }`}
    >
      <div className="flex w-full items-center justify-center px-[15px]">
        <p
          className={`flex-1 font-medium uppercase leading-none text-label transition-[font-size] duration-300 mb-1 ${
            isOpen ? 'text-[12px] tracking-[1.6px]' : 'text-[10px] tracking-[1.6px]'
          }`}
        >
          Step {stepNumber} of {totalSteps}
        </p>
      </div>

      <button
        type="button"
        id={headerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className={`flex w-full flex-wrap items-center gap-x-[3px] gap-y-[6px] px-[15px] py-[20px] text-left ${
          isOpen ? 'border-t-[0.5px] border-ink-soft' : 'border-y-[0.5px] border-ink-soft'
        }`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-[8px]">
          <img src={icon} alt="" className="size-[22px] shrink-0 md:size-[26px]" />
          <span className="min-w-0 flex-1 text-[18px] font-semibold leading-tight text-ink md:text-[22px] md:leading-none">
            {title}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-[4px]">
          {typeof selectedCount === 'number' && (
            <>
              {/* Mobile: always visible */}
              <span className="sm:hidden whitespace-nowrap text-[14px] font-medium leading-4 text-brand">
                {selectedCount} selected
              </span>
              {/* sm+: only visible when open */}
              {isOpen && (
                <span className="hidden sm:inline whitespace-nowrap text-[14px] font-medium leading-4 text-brand">
                  {selectedCount} selected
                </span>
              )}
            </>
          )}
          <img
            src="/assets/icon-chevron-down.svg"
            alt=""
            className={`h-[7px] w-[10px] shrink-0 transition-transform duration-300 ease-out ${isOpen ? '' : 'rotate-180'}`}
          />
        </span>
      </button>

      <Collapse open={isOpen} className="w-full" durationMs={ACCORDION_TRANSITION_MS}>
        <div id={panelId} role="region" aria-labelledby={headerId} className="flex w-full flex-col gap-[15px] px-[15px] pb-[20px]">
          {children}
          <button
            type="button"
            onClick={onNext}
            className="flex h-[39px] shrink-0 items-center justify-center self-center rounded-[7px] border border-brand px-[24px] py-[5px] text-[18px] font-semibold leading-[24px] text-brand transition-[background-color,transform] duration-150 hover:bg-brand/5 active:scale-[0.97]"
          >
            {nextLabel}
          </button>
        </div>
      </Collapse>
    </section>
  );
});
