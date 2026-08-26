import type { ReactNode } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface CollapseProps {
  open: boolean;
  children: ReactNode;
  className?: string;
  durationMs?: number;
}

/** A CSS-only smooth height+opacity transition between "collapsed" and "expanded" that
 *  works with genuinely dynamic content height (no JS measurement, no layout thrash) via
 *  the `grid-template-rows: 0fr → 1fr` technique. Content stays mounted at all times so
 *  React never has to remount it — only the transition state changes. */
export function Collapse({ open, children, className = '', durationMs = 280 }: CollapseProps) {
  const reducedMotion = usePrefersReducedMotion();
  const duration = reducedMotion ? 0 : durationMs;

  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateRows: open ? '1fr' : '0fr',
        opacity: open ? 1 : 0,
        transition: `grid-template-rows ${duration}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${Math.round(duration * 0.8)}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      }}
      aria-hidden={!open}
    >
      {/* `inert` pulls collapsed content out of tab order and the a11y tree without
          affecting the CSS transition itself (unlike `visibility`/`display`, which
          would either skip the animation or leave focusable elements reachable). */}
      <div className="min-h-0 overflow-hidden" inert={!open || undefined}>
        {children}
      </div>
    </div>
  );
}
