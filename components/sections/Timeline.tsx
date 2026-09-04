"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useGSAP, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { onLayoutReady } from "@/lib/layoutReady";
import Eyebrow from "@/components/ui/Eyebrow";
import { TIMELINE } from "@/config/game";
import { formatDate } from "@/lib/formatDate";

export default function Timeline() {
  const t = useTranslations();
  const tSection = useTranslations("timeline");
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Deferred to onLayoutReady — a pin created with a plain "top top" start
  // before the scroll-video chapter's async pin-spacer lands caches a
  // position measured against a too-short document, and a later
  // ScrollTrigger.refresh() (the video chapter calls one) does not correct
  // an already-pinned trigger's cached start. See lib/layoutReady.ts and
  // the identical fix on ModelChapter.tsx, which is where this was first
  // diagnosed. The `end` here is already function-based so it self-corrects
  // on refresh, but `start` needed this too.
  useGSAP(
    () => {
      if (reducedMotion || !isDesktop) return;
      return onLayoutReady(() => setup());

      function setup() {
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section) return;

      // Directly recomputing `distance` from the live DOM inside onUpdate
      // (rather than tweening toward a target captured once) means every
      // frame is correct regardless of what the track's real width turns
      // out to be, with nothing to desync after a layout shift.
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${Math.max(1, track.scrollWidth - section.clientWidth)}`,
        scrub: 0.6,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const distance = track.scrollWidth - section.clientWidth;
          const x = distance * self.progress;
          track.style.transform = `translate3d(${-x}px, 0, 0)`;
        },
      });
      }
    },
    { scope: sectionRef, dependencies: [reducedMotion, isDesktop] }
  );

  return (
    <section
      id="timeline"
      ref={sectionRef}
      className="relative flex h-screen flex-col overflow-hidden bg-void lg:h-screen"
    >
      <div className="relative z-10 shrink-0 px-6 pt-24 sm:px-14 sm:pt-28">
        <Eyebrow tone="pink">{tSection("kicker")}</Eyebrow>
        <h2
          className="font-display mt-6 text-paper"
          style={{ fontSize: "clamp(2.6rem, 8vw, 6rem)" }}
        >
          {tSection("heading")}
        </h2>
      </div>

      <div
        ref={trackRef}
        className={`relative z-10 flex flex-1 items-center gap-10 overflow-x-auto px-6 pb-16 sm:gap-16 sm:px-14 lg:overflow-visible ${
          isDesktop && !reducedMotion ? "lg:flex-nowrap" : "flex-nowrap snap-x snap-mandatory"
        }`}
      >
        {TIMELINE.map((event) => (
          <div
            key={event.id}
            className="relative w-[78vw] shrink-0 snap-start sm:w-[42vw] lg:w-[24vw]"
          >
            <span
              className="font-display block text-outline"
              style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
            >
              {event.year}
            </span>
            <div className="mt-4 h-px w-12 bg-sunset-pink" />
            <h3 className="font-display mt-4 text-xl text-paper sm:text-2xl">
              {t(event.titleKey)}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              {t(event.descriptionKey)}
            </p>
            <span className="mt-4 block text-[10px] uppercase tracking-[0.25em] text-mist-dim">
              {formatDate(event.date)}
            </span>
          </div>
        ))}
      </div>

      {isDesktop && !reducedMotion && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex justify-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-mist-dim">
            {tSection("kicker")}
          </span>
        </div>
      )}
    </section>
  );
}
