interface BadgeProps {
  children: React.ReactNode;
  tone?: 'discount' | 'financing';
  className?: string;
}

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  discount: 'rounded-[10px] px-[6px] py-[2px] text-[12px] font-semibold',
  financing: 'rounded-[3px] px-[8px] py-[5px] text-[12px] font-medium tracking-[-0.6px]',
};

export function Badge({ children, tone = 'discount', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center whitespace-nowrap bg-brand text-white ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
