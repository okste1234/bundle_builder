import type { ReactNode } from 'react';

interface ReviewSectionProps {
  label: string | ReactNode;
  children: ReactNode;
}

export function ReviewSection({ label, children }: ReviewSectionProps) {
  return (
    <div className="flex w-full flex-col items-start gap-[8px] border-t border-line pt-[15px]">
      <p className="text-center text-[12px] uppercase leading-[16px] tracking-[0.36px] text-muted">{label}</p>
      <div className="flex w-full flex-col gap-[12px]">{children}</div>
    </div>
  );
}
