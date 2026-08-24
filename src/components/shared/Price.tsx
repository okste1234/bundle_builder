import { formatPrice } from '../../utils/formatPrice';

interface PriceProps {
  current: number;
  compareAt?: number;
  /** Render "FREE" instead of $0.00 when current is 0 and a discount applies. */
  freeWhenZero?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** "gray" matches the builder product card; "brand" matches the review panel. */
  emphasis?: 'gray' | 'brand';
  layout?: 'stack' | 'inline';
  className?: string;
  suffix?: string;
  /** Plays a brief, subtle pulse whenever the displayed value changes. On by default —
   *  set false for prices that never change post-mount (avoids pulsing on first paint
   *  being meaningful vs. noise). */
  animateOnChange?: boolean;
}

const sizeClasses: Record<NonNullable<PriceProps['size']>, { compare: string; current: string }> = {
  sm: { compare: 'text-[14px]', current: 'text-[14px] font-semibold' },
  md: { compare: 'text-[16px]', current: 'text-[16px]' },
  lg: { compare: 'text-[18px]', current: 'text-[24px] font-bold' },
};

export function Price({
  current,
  compareAt,
  freeWhenZero = false,
  size = 'md',
  emphasis = 'gray',
  layout = 'stack',
  className = '',
  suffix,
  animateOnChange = true,
}: PriceProps) {
  const hasDiscount = compareAt !== undefined && compareAt > current;
  const currentLabel = freeWhenZero && current === 0 ? 'FREE' : `${formatPrice(current)}${suffix ?? ''}`;
  const compareLabel = hasDiscount ? `${formatPrice(compareAt)}${suffix ?? ''}` : null;
  const currentColor = emphasis === 'brand' ? 'text-brand' : 'text-body';
  const compareColor = emphasis === 'brand' ? 'text-body-2' : 'text-danger';
  const { compare: compareCls, current: currentCls } = sizeClasses[size];

  return (
    <div
      className={`flex ${layout === 'stack' ? 'flex-col items-end gap-[3px]' : 'flex-row items-baseline gap-[8px]'} tracking-[0.6px] ${className}`}
    >
      {compareLabel && (
        <span
          key={animateOnChange ? compareLabel : undefined}
          className={`${compareCls} ${compareColor} line-through decoration-from-font ${animateOnChange ? 'animate-value-pulse' : ''}`}
        >
          {compareLabel}
        </span>
      )}
      <span
        key={animateOnChange ? currentLabel : undefined}
        className={`${currentCls} ${currentColor} inline-block leading-none ${animateOnChange ? 'animate-value-pulse' : ''}`}
      >
        {currentLabel}
      </span>
    </div>
  );
}
