"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";
import { onLayoutReady } from "@/lib/layoutReady";
import Eyebrow from "@/components/ui/Eyebrow";

const META_KEYS = [
  ["meta1Label", "meta1Value"],
  ["meta2Label", "meta2Value"],
  ["meta3Label", "meta3Value"],
  ["meta4Label", "meta4Value"],
] as const;

export default function Intro() {
  const t = useTranslations("intro");
  const sectionRef = useRef<HTMLDivElement>(null);

  // One continuous scrub across the section's full pass through the
  // viewport (no pin — this doesn't need one) instead of the previous
  // "top 70% / bottom 60%" window, which only covered the entrance: once
  // scrolled past, everything just sat at its final state with no designed
  // exit, and the eyebrow wasn't part of the timeline at all so it popped
  // in the instant the section mounted. Widening the trigger to the
  // section's true entry/exit and folding every element into one timeline
  // means entrance and exit are driven by the same scrub value — reversible,
  // connected, never an abrupt cut.
  // Deferred to onLayoutReady for the same reason as the model chapter (see
  // lib/layoutReady.ts): the scroll-video chapter's pin-spacer is only
  // inserted once its metadata loads, and every ScrollTrigger created before
  // that lands measures "bottom top" etc. against a document that's ~4
  // viewport-heights too short. The video chapter's own refresh() call
  // fires immediately on that same tick, before the browser has actually
  // committed/painted the new layout, so it doesn't correct triggers created
  // earlier in the same pass — confirmed here the same way as the model
  // chapter: the section sat permanently clamped at its exit state because
  // its cached end was thousands of pixels earlier than the real one.
  useGSAP(
    () => {
      return onLayoutReady(() => setup());

      function setup() {
      if (!sectionRef.current) return;
      gsap.set(".intro-glow", { opacity: 0 });
      gsap.set(".intro-eyebrow", { opacity: 0, y: 10 });
      gsap.set(".intro-big-word", { opacity: 0, xPercent: -4 });
      gsap.set(".intro-reveal", { clipPath: "inset(0 0 100% 0)" });
      gsap.set(".intro-meta-row", { opacity: 0, y: 16 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          end: "bottom top",
          scrub: 0.6,
        },
        defaults: { ease: "power2.out" },
      });

      // ENTRANCE — ambient glow lifts first (darkness receding), then the
      // eyebrow, then the heading unmasks bottom-up, then the copy follows
      // it in, then the metadata row settles last.
      tl.to(".intro-glow", { opacity: 1, duration: 0.6 }, 0)
        .to(".intro-eyebrow", { opacity: 1, y: 0, duration: 0.3 }, 0.05)
        .to(".intro-big-word", { opacity: 1, xPercent: 0, duration: 0.55, ease: "power2.out" }, 0.15)
        .to(
          ".intro-reveal",
          { clipPath: "inset(0 0 0% 0)", duration: 0.5, stagger: 0.12, ease: "power3.out" },
          0.2
        )
        .to(".intro-meta-row", { opacity: 1, y: 0, duration: 0.35, stagger: 0.07 }, 0.55)

        // HOLD — legible and still for a beat (roughly 0.9 to 1.7) before
        // the section starts making room for what follows.

        // EXIT — the heading/copy mask shut the opposite way they opened
        // (a wipe to the right, not a mirrored fade-down), closing in
        // reverse order of arrival so the copy separates from the heading
        // rather than the whole block vanishing as one unit; the glow and
        // big background word recede behind it.
        .to(
          ".intro-reveal",
          {
            clipPath: "inset(0 100% 0 0)",
            duration: 0.4,
            stagger: { each: 0.1, from: "end" },
            ease: "power2.in",
          },
          1.75
        )
        .to(".intro-meta-row", { opacity: 0, y: -14, duration: 0.3, stagger: 0.05 }, 1.75)
        .to(".intro-big-word", { opacity: 0, xPercent: 6, duration: 0.4 }, 1.85)
        .to(".intro-glow", { opacity: 0, duration: 0.45 }, 1.9);
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="story"
      ref={sectionRef}
      className="relative overflow-hidden bg-void px-6 py-32 sm:px-14"
    >
      <div
        className="intro-glow pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 30% 40%, rgba(255,61,129,0.16), transparent 70%), radial-gradient(45% 45% at 80% 70%, rgba(155,77,255,0.14), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <span
        className="intro-big-word font-display pointer-events-none absolute -right-[4vw] top-10 select-none text-outline"
        style={{ fontSize: "clamp(10rem, 34vw, 32rem)" }}
        aria-hidden="true"
      >
        {t("bigWord")}
      </span>

      <div className="relative z-10 mx-auto max-w-[1400px]">
        <div className="intro-eyebrow">
          <Eyebrow>{t("kicker")}</Eyebrow>
        </div>

        <div className="mt-6 overflow-hidden">
          <h2
            className="intro-reveal font-display max-w-3xl"
            style={{ fontSize: "clamp(2.6rem, 7vw, 6rem)" }}
          >
            {t("heading")}
          </h2>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="overflow-hidden">
            <p className="intro-reveal max-w-md text-lg leading-relaxed text-mist">
              {t("paragraph1")}
            </p>
          </div>
          <div className="overflow-hidden lg:mt-24">
            <p className="intro-reveal max-w-md text-lg leading-relaxed text-mist">
              {t("paragraph2")}
            </p>
          </div>
        </div>

        <div className="intro-meta-row mt-24 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-8 sm:grid-cols-4">
          {META_KEYS.map(([labelKey, valueKey]) => (
            <div key={labelKey}>
              <div className="text-[10px] uppercase tracking-[0.3em] text-mist-dim">
                {t(labelKey)}
              </div>
              <div className="mt-2 font-display text-xl text-paper sm:text-2xl">
                {t(valueKey)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
