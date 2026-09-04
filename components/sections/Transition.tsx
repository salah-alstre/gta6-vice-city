"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";
import { onLayoutReady } from "@/lib/layoutReady";

/**
 * Chapter 01 -> 02 bridge. Not pinned — a short beat of pure darkness with
 * one controlled ambient light source and the title resolving out of it.
 */
export default function Transition() {
  const t = useTranslations("transition");
  const sectionRef = useRef<HTMLDivElement>(null);

  // Deferred to onLayoutReady — this section sits right after the scroll
  // video, so its trigger is especially exposed to the video's async
  // pin-spacer landing after this component's own mount. See
  // lib/layoutReady.ts and the same fix on Intro.tsx for the full story.
  useGSAP(
    () => {
      return onLayoutReady(() => setup());

      function setup() {
      if (!sectionRef.current) return;
      gsap.set(".transition-glow", { opacity: 0, scale: 0.6 });
      gsap.set(".transition-eyebrow", { opacity: 0 });
      gsap.set(".transition-title", { clipPath: "inset(0 0 100% 0)" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          end: "top 15%",
          scrub: 0.5,
        },
      });

      tl.to(".transition-glow", { opacity: 1, scale: 1, duration: 1 }, 0)
        .to(".transition-eyebrow", { opacity: 1, duration: 0.4 }, 0.1)
        .to(
          ".transition-title",
          { clipPath: "inset(0 0 0% 0)", duration: 1, ease: "power3.out" },
          0.15
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-void py-32"
    >
      <div
        className="transition-glow pointer-events-none absolute left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(240,25,138,0.35), rgba(155,77,255,0.12) 55%, transparent 75%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="transition-eyebrow">
          <span className="text-[11px] font-semibold uppercase tracking-[0.4em] text-mist-dim">
            {t("eyebrow")}
          </span>
        </div>
        <div className="overflow-hidden">
          <h2 className="transition-title font-display leading-[0.9]">
            <span
              className="block text-mist"
              style={{ fontSize: "clamp(2.2rem, 7vw, 5rem)" }}
            >
              {t("title1")}
            </span>
            <span
              className="block text-gradient-vice"
              style={{ fontSize: "clamp(3.5rem, 12vw, 9rem)" }}
            >
              {t("title2")}
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
}
