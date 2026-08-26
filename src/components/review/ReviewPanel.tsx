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
      className="md:rounded-t-[10px] xl:rounded-[10px] bg-surface-tint px-[20px] pb-[31px] pt-[15px] lg:pt-[20px] xl:pt-[15px] xl:sticky xl:top-8"
    >
      {/* At lg (1024–1199) alone — the "stacked variant" reference — the review panel
          splits into two side-by-side columns instead of one vertical stack: the summary
          heading + line items on the left, guarantee/total/checkout on the right (which
          stays shorter and top-aligned, not stretched to match the item list's height).
          sm/md and xl+ keep the single-column stack these were always in. */}

      <p className="text-left text-[12px] font-medium uppercase leading-none tracking-[1.6px] text-label lg:invisible xl:visible">
          Review
      </p>
      <div className="flex w-full flex-col items-start gap-[10px] lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-10 lg:gap-y-0 xl:flex xl:gap-y-[10px] pt-4">
        <div className="flex w-full flex-col items-start gap-[10px]">
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
        </div>

        <div className="flex w-full flex-col gap-[8px]">
          <div className="flex w-full flex-col gap-[4px]">
            <div className="flex w-full lg:flex-col xl:flex-row items-center lg:items-start lg:gap-4 xl:gap-0 xl:items-center justify-between">
              <div className="w-full flex items-center gap-5">
                <ProductImage src={guarantee.image} alt={guarantee.label} className="size-[78px] lg:size-[131px] xl:size-[78px]" />
                {/* This copy only appears in the lg "stacked variant" layout — neither the
                    mobile frame nor the xl+ sidebar design shows it next to the guarantee badge. */}
                <div className="hidden lg:block xl:hidden">
                  <p className="text-[15px] leading-[1.1] tracking-[0.6px] text-ink-soft">
                    <span className="block font-semibold mb-5">
                      30-day hassle-free returns
                    </span>
                    <span className="block">
                      If you&rsquo;re not totally in love with the product, we will refund you 100%.
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex h-full flex-col lg:flex-row xl:flex-col items-end w-full justify-center lg:justify-between xl:justify-center gap-[8px]">
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
                disabled={isBundleEmpty}
                aria-disabled={isBundleEmpty || preparingCheckout}
                aria-busy={preparingCheckout}
                title={isBundleEmpty ? 'Add at least one product to your bundle to check out.' : undefined}
                className={`flex w-full items-center justify-center rounded-[4px] bg-brand px-[16px] py-[13px] text-[17px] font-bold text-white transition-[opacity,transform] duration-150 hover:enabled:opacity-90 active:enabled:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                  preparingCheckout ? 'pointer-events-none opacity-80' : ''
                }`}
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
      </div>
    </aside>
  );
}
