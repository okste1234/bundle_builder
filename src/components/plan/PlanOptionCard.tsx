import type { Plan } from '../../types';
import { Price } from '../shared/Price';

interface PlanOptionCardProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
}

export function PlanOptionCard({ plan, isSelected, onSelect }: PlanOptionCardProps) {
  const namePrefix = plan.nameAccent ? plan.name.replace(plan.nameAccent, '').trim() : null;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      className={`flex w-full items-center justify-between gap-[16px] rounded-[10px] bg-white p-[16px] text-left transition-colors ${
        isSelected ? 'border-2 border-[rgba(78,47,210,0.7)]' : 'border-2 border-transparent ring-1 ring-line-soft'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-[10px]">
        <img src={plan.icon} alt="" className="size-[26px] shrink-0" />
        <div className="flex min-w-0 flex-col gap-[4px]">
          <p className="text-[16px] font-bold leading-none tracking-[-0.032px] text-ink">
            {namePrefix ? (
              <>
                {namePrefix}{' '}
                <span className="text-brand">{plan.nameAccent}</span>
              </>
            ) : (
              plan.name
            )}
          </p>
          <p className="text-[12px] leading-[1.3] text-[rgba(31,31,31,0.75)]">{plan.description}</p>
        </div>
      </div>
      <Price current={plan.price} compareAt={plan.compareAtPrice} size="sm" emphasis="brand" suffix="/mo" />
    </button>
  );
}
