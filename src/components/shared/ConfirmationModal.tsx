import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckIcon } from './CheckIcon';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onViewSystem?: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
const EXIT_DURATION_MS = 220;

/** A self-built checkout confirmation dialog: focus-trapped, Escape-to-close,
 *  click-outside-to-close, scroll-locked while open, and focus-restoring on close. No
 *  modal library — just a portal + a couple of effects. */
export function ConfirmationModal({ open, onClose, onViewSystem }: ConfirmationModalProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Sync `mounted` to `open` directly during render (React's documented pattern for
  // adjusting state from props) rather than via an effect — `open` flipping true should
  // mount immediately, with no extra render+commit round-trip.
  if (open && !mounted) {
    setMounted(true);
  }

  useEffect(() => {
    if (!mounted) return;
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
      return () => cancelAnimationFrame(raf);
    }
    const timer = setTimeout(
      () => {
        setMounted(false);
        setEntered(false);
      },
      reducedMotion ? 0 : EXIT_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [open, mounted, reducedMotion]);

  // `open` flips false immediately (starting the exit transition); `entered` only resets
  // once the exit timer above actually completes. Combining them here means the visible
  // class always reflects "closing" the instant `open` does, without a synchronous
  // setState in the effect itself.
  const visuallyEntered = entered && open;

  useEffect(() => {
    if (mounted) return;
    previouslyFocused.current?.focus();
    previouslyFocused.current = null;
  }, [mounted]);

  useEffect(() => {
    if (entered && dialogRef.current) {
      const focusable = dialogRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (focusable ?? dialogRef.current).focus();
    }
  }, [entered]);

  useEffect(() => {
    if (!mounted) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mounted, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-ink/50 backdrop-blur-[2px] transition-opacity duration-200 motion-reduce:transition-none ${
          visuallyEntered ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-confirm-title"
        aria-describedby="checkout-confirm-desc"
        tabIndex={-1}
        className={`relative flex max-h-[calc(100dvh-2rem)] w-full max-w-[380px] flex-col items-center gap-[20px] overflow-y-auto rounded-[16px] bg-white px-[28px] py-[32px] text-center shadow-[0_24px_64px_rgba(11,13,16,0.28)] transition-all duration-[220ms] ease-out motion-reduce:transition-none ${
          visuallyEntered ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0'
        }`}
      >
        <span className="flex size-[64px] shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal">
          <CheckIcon size={32} animate={visuallyEntered && !reducedMotion} />
        </span>
        <div className="flex flex-col gap-[8px]">
          <h2 id="checkout-confirm-title" className="text-[22px] font-semibold leading-tight text-ink-soft">
            You&rsquo;re all set!
          </h2>
          <p id="checkout-confirm-desc" className="text-[14px] leading-[1.4] text-body">
            Your security system is ready for checkout.
          </p>
        </div>
        <div className="flex w-full flex-col gap-[10px]">
          <button
            type="button"
            onClick={onClose}
            className="font-gilroy flex w-full items-center justify-center rounded-[4px] bg-brand px-[16px] py-[13px] text-[16px] font-extrabold text-white transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.98]"
          >
            Done
          </button>
          {onViewSystem && (
            <button
              type="button"
              onClick={() => {
                onViewSystem();
                onClose();
              }}
              className="py-[4px] text-[14px] font-medium text-brand underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              View system
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
