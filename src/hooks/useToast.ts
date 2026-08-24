import { useCallback, useEffect, useRef, useState } from 'react';

interface ToastContent {
  title: string;
  description?: string;
}

const EXIT_DURATION_MS = 300;

/** A minimal toast lifecycle: show → auto-dismiss after `durationMs` → play the exit
 *  transition → unmount. Deliberately not a queue/stacking system — this product only
 *  ever needs one toast on screen at a time. */
export function useToast(durationMs = 3200) {
  const [content, setContent] = useState<ToastContent | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const removeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(
    (title: string, description?: string) => {
      clearTimeout(hideTimer.current);
      clearTimeout(removeTimer.current);
      setContent({ title, description });
      // Mount first, then flip to visible next frame so the enter transition actually plays.
      setVisible(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        removeTimer.current = setTimeout(() => setContent(null), EXIT_DURATION_MS);
      }, durationMs);
    },
    [durationMs],
  );

  useEffect(
    () => () => {
      clearTimeout(hideTimer.current);
      clearTimeout(removeTimer.current);
    },
    [],
  );

  return { content, visible, show };
}
