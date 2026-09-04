"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Tracks whether an element is anywhere near the viewport so expensive work
 * (WebGL rendering, video decoding) can pause when a chapter is far away.
 * Also latches `everInView` (sticks true once the element has been seen
 * once) — set from inside the same IntersectionObserver callback rather
 * than a separate effect watching `inView`, so it's an event-driven update
 * (fine) and not a synchronous "derive on mount" one (flagged by
 * react-hooks/set-state-in-effect).
 */
export function useInView<T extends HTMLElement>(
  options: IntersectionObserverInit = { rootMargin: "40% 0px 40% 0px" }
): [RefObject<T | null>, boolean, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const [everInView, setEverInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setEverInView(true);
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, inView, everInView];
}
