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
    'flex size-[20px] shrink-0 items-center justify-center rounded-[4px] transition-colors disabled:cursor-not-allowed';
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
        <img src="/assets/icon-minus.svg" alt="" className="h-[9.6px] w-[8px]" />
      </button>
      <span className="min-w-[8px] text-center text-[16px] font-medium leading-[20px] text-ink tabular-nums">
        {quantity}
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
