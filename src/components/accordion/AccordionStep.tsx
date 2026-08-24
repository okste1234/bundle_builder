import type { ReactNode } from 'react';

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

export function AccordionStep({
  stepId,
  stepNumber,
  totalSteps,
  title,
  icon,
  isOpen,
  selectedCount,
  onToggle,
  nextLabel,
  onNext,
  children,
}: AccordionStepProps) {
  const panelId = `step-panel-${stepId}`;
  const headerId = `step-header-${stepId}`;

  return (
    <section
      className={
        isOpen
          ? 'flex w-full flex-col items-start gap-[5px] rounded-[10px] bg-surface-tint pt-[15px]'
          : 'flex w-full flex-col items-start gap-[5px]'
      }
    >
      <div className="flex w-full items-center justify-center px-[15px]">
        <p
          className={`flex-1 font-medium uppercase leading-none text-label ${
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
        className={`flex w-full items-center gap-[3px] px-[15px] py-[20px] text-left ${
          isOpen ? 'border-t-[0.5px] border-ink-soft' : 'border-y-[0.5px] border-ink-soft'
        }`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-[8px]">
          <img src={icon} alt="" className="size-[26px] shrink-0" />
          <span className="min-w-0 flex-1 truncate text-[22px] font-semibold leading-none text-ink">{title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-[4px]">
          {isOpen && typeof selectedCount === 'number' && (
            <span className="whitespace-nowrap text-[14px] font-medium leading-[16px] text-brand">
              {selectedCount} selected
            </span>
          )}
          <img
            src="/assets/icon-chevron-down.svg"
            alt=""
            className={`size-[12px] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {isOpen && (
        <div id={panelId} role="region" aria-labelledby={headerId} className="flex w-full flex-col gap-[15px] px-[15px] pb-[20px]">
          {children}
          <button
            type="button"
            onClick={onNext}
            className="flex h-[39px] shrink-0 items-center justify-center self-start rounded-[7px] border border-brand px-[24px] py-[5px] text-[18px] font-semibold leading-[24px] text-brand transition-colors hover:bg-brand/5"
          >
            {nextLabel}
          </button>
        </div>
      )}
    </section>
  );
}
