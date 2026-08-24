import { useEffect, useRef, useState } from 'react';

export interface AnimatedItem<T> {
  key: string;
  item: T;
  exiting: boolean;
}

/** Keeps a removed item mounted (flagged `exiting: true`) for `exitMs` after it drops out
 *  of `items`, so the caller can play a collapse/fade-out transition before the DOM node
 *  actually disappears — without pulling in a full animation-presence library. Items that
 *  reappear before their exit timer fires are seamlessly resurrected. */
export function useAnimatedItems<T extends { key: string }>(items: T[], exitMs = 220): AnimatedItem<T>[] {
  const [display, setDisplay] = useState<AnimatedItem<T>[]>(() => items.map((item) => ({ key: item.key, item, exiting: false })));
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const nextByKey = new Map(items.map((item) => [item.key, item]));

    setDisplay((prevDisplay) => {
      const prevKeys = new Set(prevDisplay.map((entry) => entry.key));
      const merged: AnimatedItem<T>[] = [];

      for (const entry of prevDisplay) {
        const fresh = nextByKey.get(entry.key);
        if (fresh) {
          const timer = timers.current.get(entry.key);
          if (timer) {
            clearTimeout(timer);
            timers.current.delete(entry.key);
          }
          merged.push({ key: entry.key, item: fresh, exiting: false });
        } else if (!entry.exiting) {
          merged.push({ ...entry, exiting: true });
          const timer = setTimeout(() => {
            setDisplay((d) => d.filter((e) => e.key !== entry.key));
            timers.current.delete(entry.key);
          }, exitMs);
          timers.current.set(entry.key, timer);
        } else {
          merged.push(entry);
        }
      }

      for (const item of items) {
        if (!prevKeys.has(item.key)) merged.push({ key: item.key, item, exiting: false });
      }

      return merged;
    });
  }, [items, exitMs]);

  useEffect(() => {
    const timersMap = timers.current;
    return () => {
      for (const timer of timersMap.values()) clearTimeout(timer);
    };
  }, []);

  return display;
}
