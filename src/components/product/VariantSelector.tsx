import type { Variant } from '../../types';

interface VariantSelectorProps {
  productName: string;
  variants: Variant[];
  selectedId: string | null;
  onSelect: (variantId: string) => void;
}

export function VariantSelector({ productName, variants, selectedId, onSelect }: VariantSelectorProps) {
  return (
    <div role="radiogroup" aria-label={`${productName} color`} className="flex items-end gap-[6px]">
      {variants.map((variant) => {
        const isSelected = variant.id === selectedId;
        return (
          <button
            key={variant.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(variant.id)}
            className={`flex h-[26px] items-center justify-center gap-[4px] rounded-[2px] px-[5px] py-px transition-colors ${
              isSelected
                ? 'border-[0.5px] border-brand-teal bg-[rgba(29,240,187,0.04)] px-[3px]'
                : 'border-[0.5px] border-[#ccc] bg-white'
            }`}
          >
            <img src={variant.swatchImage} alt="" className="size-[22px] rounded-[5px] object-cover" />
            <span className="whitespace-nowrap text-[10px] font-medium tracking-[0.6px] text-ink-soft">
              {variant.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
