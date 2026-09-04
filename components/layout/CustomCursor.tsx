"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "@/lib/gsap";
import { useIsTouch } from "@/hooks/useMediaQuery";

/**
 * A single cursor replacement, not two shapes sharing the screen: a small
 * glowing point at idle, which yields to a larger labeled ring only while
 * hovering something interactive. The native cursor is hidden for the
 * entire time this is mounted (see .custom-cursor-on in globals.css) —
 * leaving it visible during plain movement was what made the old dot read
 * as a leftover debug overlay rather than a deliberate cursor.
 */
export default function CustomCursor() {
  const t = useTranslations("cursor");
  const isTouch = useIsTouch();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (isTouch) return;

    document.body.classList.add("custom-cursor-on");

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const setDot = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3.out" });
    const setDotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3.out" });
    const setRing = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
    const setRingY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      setDot(e.clientX);
      setDotY(e.clientY);
      setRing(e.clientX);
      setRingY(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>("[data-cursor]");
      if (target) {
        setLabel(target.dataset.cursor ?? null);
        setActive(true);
      }
    };

    const onOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>("[data-cursor]");
      if (target) {
        setLabel(null);
        setActive(false);
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.body.classList.remove("custom-cursor-on");
    };
  }, [isTouch]);

  if (isTouch) return null;

  const labelText = label && t.has(label) ? t(label) : label;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[90] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sunset-pink transition-opacity duration-200"
        style={{
          opacity: active ? 0 : 1,
          boxShadow: "0 0 14px 3px rgba(255,61,129,0.55)",
        }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[90] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-sunset-pink/70 bg-void/50 backdrop-blur-sm transition-[opacity,scale] duration-300 ease-out"
        style={{
          // `scale` (not `transform`) so this never fights the translate
          // GSAP's quickTo is independently composing into `transform`.
          opacity: active ? 1 : 0,
          scale: active ? "1" : "0.5",
        }}
      >
        {labelText && (
          <span className="text-[9px] uppercase tracking-[0.15em] text-paper">
            {labelText}
          </span>
        )}
      </div>
    </>
  );
}
