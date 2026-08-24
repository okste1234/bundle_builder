import { useState } from 'react';
import { useBundle } from '../../state/useBundle';
import { getAllLineItems, getTotals } from '../../state/selectors';
import { financing, guarantee, plansById, shipping } from '../../data/catalog';
import { ReviewCategorySection } from './ReviewCategorySection';
import { ReviewSection } from './ReviewSection';
import { ReviewInfoRow } from './ReviewInfoRow';
import { Badge } from '../shared/Badge';
import { Price } from '../shared/Price';
import { Toast } from '../shared/Toast';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { ProductImage } from '../shared/ProductImage';
import { useToast } from '../../hooks/useToast';

const CHECKOUT_PREPARE_MS = 450;

export function ReviewPanel() {
  const { state, saveForLater } = useBundle();
  const { content: toast, visible: toastVisible, show: showToast } = useToast();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [preparingCheckout, setPreparingCheckout] = useState(false);

  const totals = getTotals(state);
  const plan = state.planId ? plansById[state.planId] : null;
  const hasDiscount = totals.compareAtTotal > totals.currentTotal;
  const isBundleEmpty = getAllLineItems(state).length === 0 && !plan;

  function handleCheckout() {
    if (isBundleEmpty || preparingCheckout) return;
    setPreparingCheckout(true);
    window.setTimeout(() => {
      setPreparingCheckout(false);
      setConfirmationOpen(true);
    }, CHECKOUT_PREPARE_MS);
  }

  function handleSave() {
    saveForLater();
    showToast('System saved', 'Your configuration has been saved. You can return anytime and continue where you left off.');
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
        <ReviewCategorySection category="camera" state={state} />
        <ReviewCategorySection category="sensor" state={state} />
        <ReviewCategorySection category="accessory" state={state} />

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
            <ProductImage src={guarantee.image} alt={guarantee.label} className="size-[78px]" />
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
              disabled={isBundleEmpty || preparingCheckout}
              aria-disabled={isBundleEmpty || preparingCheckout}
              title={isBundleEmpty ? 'Add at least one product to your bundle to check out.' : undefined}
              className="flex w-full items-center justify-center rounded-[4px] bg-brand px-[16px] py-[13px] text-[17px] font-bold text-white transition-[opacity,transform] duration-150 hover:enabled:opacity-90 active:enabled:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {preparingCheckout ? 'Preparing…' : 'Checkout'}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full text-center text-[14px] italic leading-[1.2] text-label underline underline-offset-2 transition-opacity hover:opacity-70"
        >
          Save my system for later
        </button>
      </div>

      {toast && <Toast visible={toastVisible} title={toast.title} description={toast.description} />}

      <ConfirmationModal open={confirmationOpen} onClose={() => setConfirmationOpen(false)} />
    </aside>
  );
}
