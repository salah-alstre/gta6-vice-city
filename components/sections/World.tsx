"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { onLayoutReady } from "@/lib/layoutReady";
import Eyebrow from "@/components/ui/Eyebrow";
import { WORLD_LOCATIONS } from "@/data/world";

const N = WORLD_LOCATIONS.length;
const STEP = 1 / N;
const OVERLAP = STEP * 0.22;

/**
 * One continuous exploration, not a row of cards: a single pinned frame
 * whose full-bleed image, title, copy and ambient tint all crossfade
 * together as the location changes, with a smaller secondary photo
 * drifting in over the main image partway through each location's window.
 * Desktop only (isDesktop gate) — on narrower viewports this is a genuinely
 * different, non-pinned layout (see the mobile branch in the JSX below)
 * rather than the same design shrunk down.
 */
export default function World() {
  const t = useTranslations("world");
  const sectionRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const secondaryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tickRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  useGSAP(
    () => {
      if (reducedMotion || !isDesktop) return;
      return onLayoutReady(() => setup());

      function setup() {
      const section = sectionRef.current;
      if (!section) return;

      gsap.set(panelRefs.current, { opacity: 0 });
      gsap.set(panelRefs.current[0], { opacity: 1 });
      gsap.set(imageRefs.current, { scale: 1 });
      gsap.set(textRefs.current, { opacity: 0, x: 22 });
      gsap.set(textRefs.current[0], { opacity: 1, x: 0 });
      gsap.set(secondaryRefs.current, { opacity: 0, y: 46, scale: 0.96 });
      gsap.set(tickRefs.current, { opacity: 0.35, scaleX: 1 });
      gsap.set(tickRefs.current[0], { opacity: 1, scaleX: 1.8 });

      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

      WORLD_LOCATIONS.forEach((loc, i) => {
        const start = i * STEP;
        const end = (i + 1) * STEP;
        const panel = panelRefs.current[i];
        const image = imageRefs.current[i];
        const text = textRefs.current[i];
        const secondary = secondaryRefs.current[i];
        const tick = tickRefs.current[i];

        // Crossfade: each panel/text pair fades in over the tail of the
        // previous location's window and fades out over the head of the
        // next, so two locations are always briefly overlapped rather than
        // hard-cutting — the location NAME and image change together, never
        // separately.
        if (i > 0) {
          tl.to(panel, { opacity: 1, duration: OVERLAP, ease: "power1.inOut" }, start - OVERLAP)
            .to(text, { opacity: 1, x: 0, duration: OVERLAP, ease: "power2.out" }, start - OVERLAP * 0.6);
        }
        if (i < N - 1) {
          tl.to(panel, { opacity: 0, duration: OVERLAP, ease: "power1.inOut" }, end - OVERLAP)
            .to(text, { opacity: 0, x: -22, duration: OVERLAP, ease: "power2.in" }, end - OVERLAP * 1.4);
        }

        // Ken Burns: a slow, continuous drift across the image's own active
        // window — the frame never sits perfectly still even while holding.
        tl.fromTo(image, { scale: 1 }, { scale: 1.07, duration: end - start, ease: "none" }, start);

        // The secondary photo drifts in over the main image mid-window and
        // drifts back out before the next location takes over.
        tl.fromTo(
          secondary,
          { opacity: 0, y: 46, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: STEP * 0.22, ease: "power2.out" },
          start + STEP * 0.22
        ).to(
          secondary,
          { opacity: 0, y: -30, scale: 0.98, duration: STEP * 0.2, ease: "power2.in" },
          start + STEP * 0.6
        );

        tl.to(tick, { opacity: 1, scaleX: 1.8, duration: OVERLAP }, start).to(
          tick,
          { opacity: 0.35, scaleX: 1, duration: OVERLAP },
          end - OVERLAP
        );
      });

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=550%",
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => tl.progress(self.progress),
      });
      }
    },
    { scope: sectionRef, dependencies: [reducedMotion, isDesktop] }
  );

  return (
    <section
      id="world"
      ref={sectionRef}
      className={`relative w-full bg-void ${
        isDesktop && !reducedMotion ? "h-screen overflow-hidden" : ""
      }`}
    >
      {isDesktop && !reducedMotion ? (
        <>
          {WORLD_LOCATIONS.map((loc, i) => (
            <div
              key={loc.id}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              className="absolute inset-0"
            >
              <div
                ref={(el) => {
                  imageRefs.current[i] = el;
                }}
                className="absolute inset-0"
              >
                <Image
                  src={loc.image}
                  alt={t(loc.titleKey)}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  quality={90}
                  className="object-cover"
                />
              </div>
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(to top, rgba(3,3,3,0.9) 0%, rgba(3,3,3,0.25) 42%, rgba(3,3,3,0.15) 65%, rgba(3,3,3,0.55) 100%)`,
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 mix-blend-color"
                style={{
                  background: `radial-gradient(120% 90% at 12% 100%, ${loc.accent}55, transparent 60%)`,
                }}
              />
            </div>
          ))}

          {WORLD_LOCATIONS.map((loc, i) => (
            <div
              key={loc.id}
              ref={(el) => {
                secondaryRefs.current[i] = el;
              }}
              className="pointer-events-none absolute bottom-[16%] right-6 z-20 h-[26vh] w-[22vw] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] sm:right-14 sm:h-[32vh] sm:w-[19vw]"
              style={{ border: `1px solid ${loc.accent}66` }}
            >
              <Image
                src={loc.secondaryImage}
                alt=""
                fill
                sizes="20vw"
                quality={85}
                className="object-cover"
                aria-hidden="true"
              />
            </div>
          ))}

          <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-20 sm:px-14 sm:pb-24">
            <Eyebrow tone="orange">{t("kicker")}</Eyebrow>
            <h2
              className="font-display mt-4 text-gradient-vice"
              style={{ fontSize: "clamp(2.4rem, 7vw, 5.5rem)" }}
            >
              {t("heading")}
            </h2>

            <div className="relative mt-8 h-[9.5rem] max-w-xl sm:h-[8rem]">
              {WORLD_LOCATIONS.map((loc, i) => (
                <div
                  key={loc.id}
                  ref={(el) => {
                    textRefs.current[i] = el;
                  }}
                  className="absolute inset-0"
                >
                  <h3
                    className="font-display text-paper"
                    style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)" }}
                  >
                    {t(loc.titleKey)}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-mist sm:text-base">
                    {t(loc.bodyKey)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-2">
              {WORLD_LOCATIONS.map((loc) => (
                <span
                  key={loc.id}
                  ref={(el) => {
                    tickRefs.current[WORLD_LOCATIONS.indexOf(loc)] = el;
                  }}
                  className="h-[3px] w-8 origin-left bg-paper"
                />
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-mist-dim">
              {t("scrollHint")}
            </span>
          </div>
        </>
      ) : (
        // Mobile/reduced-motion: a genuinely different layout, not the
        // pinned desktop composition shrunk down — each location is a real,
        // full-bleed section in normal document flow, so it works with
        // native scrolling and needs no ScrollTrigger at all.
        <div>
          <div className="px-6 pb-10 pt-24 sm:px-14">
            <Eyebrow tone="orange">{t("kicker")}</Eyebrow>
            <h2
              className="font-display mt-4 text-gradient-vice"
              style={{ fontSize: "clamp(2.4rem, 9vw, 4.5rem)" }}
            >
              {t("heading")}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-mist">
              {t("intro")}
            </p>
          </div>

          {WORLD_LOCATIONS.map((loc) => (
            <div key={loc.id} className="relative h-[80vh] w-full overflow-hidden">
              <Image
                src={loc.image}
                alt={t(loc.titleKey)}
                fill
                sizes="100vw"
                quality={90}
                className="object-cover"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(3,3,3,0.92) 0%, rgba(3,3,3,0.2) 45%, transparent 70%)",
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 mix-blend-color"
                style={{
                  background: `radial-gradient(120% 90% at 12% 100%, ${loc.accent}55, transparent 60%)`,
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3
                  className="font-display text-paper"
                  style={{ fontSize: "clamp(1.8rem, 6vw, 2.8rem)" }}
                >
                  {t(loc.titleKey)}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist">
                  {t(loc.bodyKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
