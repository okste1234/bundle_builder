interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  /** Fixed/required item — both buttons are rendered but non-interactive. */
  disabled?: boolean;
  /** Tighter footprint used in the review panel. */
  compact?: boolean;
  label: string;
}

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  min = 0,
  max = 10,
  disabled = false,
  compact = false,
  label,
}: QuantityStepperProps) {
  const atMin = disabled || quantity <= min;
  const atMax = disabled || quantity >= max;

  const buttonBase =
    'flex size-[20px] shrink-0 items-center justify-center rounded-[4px] transition-[background-color,border-color,opacity,transform] duration-150 ease-out disabled:cursor-not-allowed active:enabled:scale-90';
  const decrementClasses = disabled
    ? 'bg-disabled-bg border border-line'
    : 'bg-white border-2 border-line-soft disabled:opacity-40';
  const incrementClasses = disabled ? 'bg-disabled-bg' : 'bg-surface-muted disabled:opacity-40';

  return (
    <div
      role="group"
      aria-label={`${label} quantity`}
      className={`flex items-center ${compact ? 'w-[72px] justify-between' : 'w-[80px] justify-center gap-[10px] py-[4px]'}`}
    >
      <button
        type="button"
        aria-label={`Decrease ${label} quantity`}
        className={`${buttonBase} ${decrementClasses}`}
        onClick={onDecrement}
        disabled={atMin}
      >
        <span className="flex h-[9.6px] w-[8px] items-center justify-center">
          <img src="/assets/icon-minus.svg" alt="" className="h-[1.6px] w-[8px]" />
        </span>
      </button>
      <span className="min-w-[8px] text-center text-[16px] font-medium leading-[20px] text-ink tabular-nums" aria-live="polite">
        <span key={quantity} className="inline-block animate-value-pulse">
          {quantity}
        </span>
      </span>
      <button
        type="button"
        aria-label={`Increase ${label} quantity`}
        className={`${buttonBase} ${incrementClasses}`}
        onClick={onIncrement}
        disabled={atMax}
      >
        <img src="/assets/icon-plus.svg" alt="" className="size-[8px]" />
      </button>
    </div>
  );
}
