import { CheckIcon } from './CheckIcon';

interface ToastProps {
  visible: boolean;
  title: string;
  description?: string;
}

/** A lightweight, self-contained toast — no external dependency. `visible` drives the
 *  enter/exit transition; the caller (useToast) controls mount/unmount timing so the exit
 *  animation has time to finish before the node is removed. */
export function Toast({ visible, title, description }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-4 bottom-6 z-[70] mx-auto flex max-w-[380px] items-start gap-[12px] rounded-[10px] bg-ink px-[16px] py-[14px] shadow-[0_12px_32px_rgba(11,13,16,0.28)] transition-all duration-300 ease-out motion-reduce:transition-none sm:inset-x-auto sm:right-6 sm:left-auto ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
    >
      <span className="mt-[1px] flex size-[20px] shrink-0 items-center justify-center rounded-full bg-brand-teal/20 text-brand-teal">
        <CheckIcon size={14} />
      </span>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold leading-tight text-white">{title}</p>
        {description && <p className="mt-[3px] text-[12px] leading-snug text-white/70">{description}</p>}
      </div>
    </div>
  );
}
