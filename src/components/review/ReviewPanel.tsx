import { useState } from 'react';
import { useBundle } from '../../state/useBundle';
import { getLineItemsForCategory, getTotals } from '../../state/selectors';
import { financing, guarantee, plansById, shipping } from '../../data/catalog';
import { ReviewSection } from './ReviewSection';
import { ReviewItem } from './ReviewItem';
import { ReviewInfoRow } from './ReviewInfoRow';
import { Badge } from '../shared/Badge';
import { Price } from '../shared/Price';
import { Toast } from '../shared/Toast';

const CATEGORY_LABELS = {
  camera: 'Cameras',
  sensor: 'Sensors',
  accessory: 'Accessories',
} as const;

export function ReviewPanel() {
  const { state, saveForLater } = useBundle();
  const [toast, setToast] = useState<string | null>(null);

  const totals = getTotals(state);
  const plan = state.planId ? plansById[state.planId] : null;
  const hasDiscount = totals.compareAtTotal > totals.currentTotal;

  function handleCheckout() {
    setToast('Your security system is ready for checkout.');
    window.setTimeout(() => setToast(null), 3200);
  }

  function handleSave() {
    saveForLater();
    setToast('Your system has been saved for later.');
    window.setTimeout(() => setToast(null), 3200);
  }

  return (
    <aside
      aria-label="Your security system review"
      className="flex w-full flex-col items-start gap-[10px] rounded-[10px] bg-surface-tint px-[20px] pb-[31px] pt-[20px] lg:sticky lg:top-8"
    >
      <p className="w-full text-left text-[12px] font-medium uppercase leading-none tracking-[1.6px] text-label">
        Review
      </p>
      <div className="flex w-full flex-col gap-[5px] tracking-[0.6px]">
        <h2 className="text-[22px] font-semibold leading-none text-ink-soft">Your security system</h2>
        <p className="w-full text-[14px] font-medium leading-[1.3] text-[rgba(31,31,31,0.75)]">
          Review your personalized protection system designed to keep what matters most safe.
        </p>
      </div>

      <div className="flex w-full flex-col gap-[10px]">
        {(['camera', 'sensor', 'accessory'] as const).map((category) => {
          const items = getLineItemsForCategory(state, category);
          if (items.length === 0) return null;

          const productLineCounts = items.reduce<Record<string, number>>((counts, item) => {
            counts[item.productId] = (counts[item.productId] ?? 0) + 1;
            return counts;
          }, {});

          return (
            <ReviewSection key={category} label={CATEGORY_LABELS[category]}>
              {items.map((item) => (
                <ReviewItem key={item.key} item={item} showVariantLabel={productLineCounts[item.productId] > 1} />
              ))}
            </ReviewSection>
          );
        })}

        {plan && (
          <ReviewSection label="Plan">
            <ReviewInfoRow
              icon={plan.icon}
              label={plan.name}
              current={plan.price}
              compareAt={plan.compareAtPrice}
              suffix="/mo"
            />
          </ReviewSection>
        )}

        <div className="w-full border-t border-line pt-[15px]">
          <ReviewInfoRow icon={shipping.icon} label={shipping.label} current={shipping.price} compareAt={shipping.compareAtPrice} />
        </div>
      </div>

      <div className="flex w-full flex-col gap-[8px]">
        <div className="flex w-full flex-col gap-[4px]">
          <div className="flex w-full items-center justify-between">
            <img src={guarantee.image} alt={guarantee.label} className="size-[78px]" />
            <div className="flex h-full flex-col items-end justify-center gap-[8px]">
              <Badge tone="financing">
                {financing.prefixLabel} {`$${totals.financingPerMonth.toFixed(2)}/mo`}
              </Badge>
              <Price current={totals.currentTotal} compareAt={totals.compareAtTotal} size="lg" emphasis="brand" layout="inline" />
            </div>
          </div>

          <div className="flex w-full flex-col gap-[4px] pt-[10px]">
            {hasDiscount && (
              <p className="w-full text-center text-[12px] font-semibold leading-none tracking-[-0.056px] text-brand-teal">
                Congrats! You&rsquo;re saving ${totals.savings.toFixed(2)} on your security bundle!
              </p>
            )}
            <button
              type="button"
              onClick={handleCheckout}
              className="flex w-full items-center justify-center rounded-[4px] bg-brand px-[16px] py-[13px] text-[17px] font-bold text-white transition-opacity hover:opacity-90"
            >
              Checkout
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full text-center text-[14px] italic leading-[1.2] text-label underline underline-offset-2"
        >
          Save my system for later
        </button>
      </div>

      {toast && <Toast message={toast} />}
    </aside>
  );
}
