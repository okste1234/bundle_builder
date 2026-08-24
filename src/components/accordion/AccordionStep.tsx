import { forwardRef, type ReactNode } from 'react';
import { Collapse } from '../shared/Collapse';

interface AccordionStepProps {
  stepId: string;
  stepNumber: number;
  totalSteps: number;
  title: string;
  icon: string;
  isOpen: boolean;
  selectedCount?: number;
  onToggle: () => void;
  nextLabel: string;
  onNext: () => void;
  children: ReactNode;
}

export const AccordionStep = forwardRef<HTMLElement, AccordionStepProps>(function AccordionStep(
  { stepId, stepNumber, totalSteps, title, icon, isOpen, selectedCount, onToggle, nextLabel, onNext, children },
  ref,
) {
  const panelId = `step-panel-${stepId}`;
  const headerId = `step-header-${stepId}`;

  return (
    <section
      ref={ref}
      className={`flex w-full scroll-mt-[24px] flex-col items-start gap-[5px] rounded-[10px] transition-[background-color,padding-top] duration-300 ease-out ${
        isOpen ? 'bg-surface-tint pt-[15px]' : 'bg-transparent pt-0'
      }`}
    >
      <div className="flex w-full items-center justify-center px-[15px]">
        <p
          className={`flex-1 font-medium uppercase leading-none text-label transition-[font-size] duration-300 ${
            isOpen ? 'text-[12px]' : 'text-[10px] tracking-[1.6px]'
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
          <img src={icon} alt="" className="size-[22px] shrink-0 sm:size-[26px]" />
          <span className="min-w-0 flex-1 text-[18px] font-semibold leading-tight text-ink sm:text-[22px] sm:leading-none">
            {title}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-[4px]">
          {isOpen && typeof selectedCount === 'number' && (
            <span className="animate-fade-in whitespace-nowrap text-[14px] font-medium leading-[16px] text-brand">
              {selectedCount} selected
            </span>
          )}
          {/* This exported asset is Figma's base "12/carrot-up" shape (unrotated = up).
              Figma's own "12/carrot-down" instance is the same shape with rotate-180
              applied — so collapsed (down) gets the rotation here, not open (up). */}
          <img
            src="/assets/icon-chevron-down.svg"
            alt=""
            className={`size-[12px] shrink-0 transition-transform duration-300 ease-out ${isOpen ? '' : 'rotate-180'}`}
          />
        </span>
      </button>

      <Collapse open={isOpen} className="w-full" durationMs={320}>
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
