interface CheckIconProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

/** A checkmark-in-a-circle glyph. When `animate` is true (and motion isn't reduced by the
 *  caller), the circle and check stroke draw themselves in via stroke-dashoffset — a
 *  restrained, one-shot entrance rather than anything bouncy or playful. */
export function CheckIcon({ size = 24, animate = false, className = '' }: CheckIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={animate ? 'check-circle-draw' : undefined}
      />
      <path
        d="M7.5 12.5L10.3 15.3L16.5 9"
        pathLength={1}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className={animate ? 'check-mark-draw' : undefined}
      />
    </svg>
  );
}
