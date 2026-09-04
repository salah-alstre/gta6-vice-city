"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";

const MIN_DURATION_MS = 1800;
const MAX_WAIT_MS = 4500;

// This deliberately does *not* also gate on GLB readiness (e.g. waiting on
// the promise AssetPreloader.tsx kicks off) — the model can take a while on
// a slow connection, and blocking the entire site reveal on a single heavy
// background asset would defeat the point of loading it early: the model is
// meant to keep downloading *after* the visitor is already looking at the
// opening video, not before they're allowed to see anything. What this
// component does guarantee, for free, is the actual requirement — the GLB
// fetch has *started* well before this ever reaches 100%: AssetPreloader is
// mounted from the root layout as a JSX sibling that appears before this
// component's own subtree, and React runs a subtree's effects (all of them,
// depth-first) before moving to the next sibling's — so its useEffect always
// fires before this one even starts, let alone before MIN_DURATION_MS elapses.
export default function Preloader({ onDone }: { onDone?: () => void }) {
  const t = useTranslations("preloader");
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const [hidden, setHidden] = useState(false);
  const progress = useRef({ value: 0 });

  useEffect(() => {
    // Guards every callback below so React Strict Mode's dev-only
    // mount->cleanup->mount double-invoke can't leave two competing sets of
    // timers/tweens/rAF loops fighting over the same refs — the first
    // instance's cleanup flips this before the second instance ever starts.
    let cancelled = false;
    let rafId = 0;
    let exitTimer = 0;
    let maxTimer = 0;
    const progressState = progress.current;
    const root = rootRef.current;

    document.body.style.overflow = "hidden";
    const start = performance.now();
    let settled = false;

    const finishLoad = () => {
      if (cancelled || settled) return;
      settled = true;
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, MIN_DURATION_MS - elapsed);
      exitTimer = window.setTimeout(runExit, remaining);
    };

    const runExit = () => {
      if (cancelled) return;
      gsap.to(progress.current, {
        value: 100,
        duration: 0.4,
        ease: "power2.out",
        onUpdate: () => {
          if (percentRef.current) {
            percentRef.current.textContent = String(
              Math.round(progress.current.value)
            );
          }
        },
        onComplete: playExit,
      });
    };

    const playExit = () => {
      if (cancelled) return;
      const tl = gsap.timeline({
        onComplete: () => {
          if (cancelled) return;
          document.body.style.overflow = "";
          setHidden(true);
          onDone?.();
        },
      });
      tl.to(rootRef.current, {
        yPercent: -100,
        duration: 1.1,
        ease: "power4.inOut",
        delay: 0.25,
      });
    };

    const tick = () => {
      if (cancelled || settled) return;
      const elapsed = performance.now() - start;
      const target = Math.min(92, (elapsed / MIN_DURATION_MS) * 92);
      progress.current.value = Math.max(progress.current.value, target);
      if (percentRef.current) {
        percentRef.current.textContent = String(
          Math.round(progress.current.value)
        );
      }
      if (lineRef.current) {
        lineRef.current.style.transform = `scaleX(${progress.current.value / 100})`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    if (document.readyState === "complete") {
      finishLoad();
    } else {
      window.addEventListener("load", finishLoad, { once: true });
    }
    maxTimer = window.setTimeout(finishLoad, MAX_WAIT_MS);

    return () => {
      cancelled = true;
      window.removeEventListener("load", finishLoad);
      window.clearTimeout(maxTimer);
      window.clearTimeout(exitTimer);
      cancelAnimationFrame(rafId);
      gsap.killTweensOf(progressState);
      if (root) gsap.killTweensOf(root);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(
    () => {
      gsap.from(".preloader-mark", {
        opacity: 0,
        yPercent: 30,
        duration: 0.9,
        ease: "power3.out",
      });
      gsap.from(".preloader-label", {
        opacity: 0,
        duration: 0.9,
        delay: 0.2,
      });
    },
    { scope: rootRef }
  );

  if (hidden) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-void"
      aria-hidden="true"
    >
      <div className="relative flex flex-col items-center">
        <span
          className="preloader-mark font-display text-gradient-vice select-none"
          style={{ fontSize: "clamp(6rem, 22vw, 14rem)" }}
        >
          {t("mark")}
        </span>

        <div className="preloader-label mt-6 flex w-56 flex-col items-center gap-3 sm:w-72">
          <div className="h-px w-full overflow-hidden bg-line">
            <div
              ref={lineRef}
              className="h-full w-full origin-left bg-gradient-to-r from-sunset-pink via-hot-magenta to-violet"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <div className="flex w-full items-center justify-between text-[10px] tracking-[0.3em] text-mist uppercase">
            <span>{t("loading")}</span>
            <span>
              <span ref={percentRef}>0</span>%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
