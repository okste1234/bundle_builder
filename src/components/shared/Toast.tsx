interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[8px] bg-ink px-[20px] py-[12px] text-[14px] font-medium text-white shadow-lg"
    >
      {message}
    </div>
  );
}
