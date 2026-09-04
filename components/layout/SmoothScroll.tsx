"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Drives Lenis off the GSAP ticker so there is a single rAF loop shared with
 * every ScrollTrigger-driven animation in the app. Disabled entirely under
 * prefers-reduced-motion, falling back to native scrolling.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;
    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
      window.__lenis = undefined;
    };
  }, [reducedMotion]);

  // Every pinned/scrubbed chapter creates its ScrollTrigger the moment it
  // mounts, measuring the document as it exists at that instant. But the
  // video chapter's pin-spacer is inserted asynchronously (after metadata
  // loads), web fonts swap in with `display: swap` after first paint, and
  // next/image can still shift layout as sources resolve — any one of
  // those, happening after an earlier chapter has already measured its
  // start/end, throws off every pinned section below it (the empty-gap /
  // overlap / clipped-timeline class of bugs). A single one-shot refresh
  // tied to one of those signals is a race; a ResizeObserver on the whole
  // document catches all of them uniformly, for the life of the page.
  useEffect(() => {
    let rafId = 0;
    const refresh = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    const ro = new ResizeObserver(refresh);
    ro.observe(document.body);

    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("load", refresh);
    };
  }, []);

  return <>{children}</>;
}
