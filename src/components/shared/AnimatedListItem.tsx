import { useEffect, useState, type ReactNode } from 'react';
import { Collapse } from './Collapse';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface AnimatedListItemProps {
  exiting: boolean;
  children: ReactNode;
}

/** Wraps a review-panel line item so it eases in on mount (new product/variant added)
 *  and collapses smoothly on the way out (quantity dropped to 0), reusing the same
 *  Collapse primitive the accordion uses so both feel like one consistent motion system. */
export function AnimatedListItem({ exiting, children }: AnimatedListItemProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [entered, setEntered] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  return (
    <Collapse open={entered && !exiting} durationMs={220}>
      {children}
    </Collapse>
  );
}
