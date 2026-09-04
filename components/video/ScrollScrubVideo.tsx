"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Chapter 01 — the scroll is the playhead.
 *
 * The video never calls play(): it is a pure currentTime scrub driven by a
 * pinned ScrollTrigger timeline, so there are no autoplay-policy concerns on
 * any browser. Engineering notes:
 *  - Setup is deferred until `loadedmetadata` so the real duration is known
 *    before the pin distance / timeline are built.
 *  - GSAP's scrub tween only ever writes a `desiredVideoTime` ref — it never
 *    touches `video.currentTime` directly. A separate rAF loop eases a
 *    `currentInterpolatedTime` ref toward that desired value and is the only
 *    thing that ever seeks the element.
 *  - `scrub: true` (no GSAP-side lag) is deliberate: the source used to be a
 *    sparsely-keyframed MP4, which meant every seek had to decode forward
 *    from a distant keyframe, and GSAP's own scrub smoothing plus this rAF
 *    lerp were both doing the same job (spreading seeks out over time) —
 *    two independent smoothing systems stacked into visible extra latency.
 *    The current source (gta6_scroll_optimized.mp4) is encoded with a
 *    keyframe roughly every 0.1s specifically so arbitrary seeks are cheap;
 *    with that true, only ONE smoothing layer is needed, and it should be
 *    the one that also gates redundant seeks — this rAF loop — not GSAP's,
 *    which only smooths the target and knows nothing about the video
 *    element itself.
 *  - The rAF loop only runs while this section is within `ROOT_MARGIN` of
 *    the viewport (IntersectionObserver-gated, checked via a ref so the
 *    60fps loop itself never touches React state). Once the video has
 *    scrolled well out of view there is no reason to keep re-seeking it or
 *    even keep the loop alive — it's cancelled and only restarted when the
 *    section comes back near the viewport.
 *  - Everything is torn down via gsap.context().revert() on unmount so nav
 *    between locales / fast refresh never leaks ScrollTriggers.
 */

const TEXT_WINDOWS: [number, number, number, number][] = [
  [0.04, 0.11, 0.17, 0.22],
  [0.28, 0.35, 0.46, 0.51],
  [0.56, 0.63, 0.73, 0.78],
  [0.83, 0.9, 0.99, 1],
];

export default function ScrollScrubVideo() {
  const t = useTranslations("video");
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const line3Ref = useRef<HTMLDivElement>(null);
  const line4Ref = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // The scrub target (`desiredVideoTime`) and the value actually pushed to
  // the element (`currentInterpolatedTime`) are refs, not React state — this
  // loop runs every animation frame and re-rendering on each tick would
  // defeat the point. See the file-level comment for why they're separate.
  const desiredVideoTime = useRef(0);
  const currentInterpolatedTime = useRef(0);
  // Set by an IntersectionObserver, read every rAF tick — keeps the loop
  // itself free of React state while letting it stop reseeking (and stop
  // requesting new frames at all) once the section is well out of view.
  const nearViewportRef = useRef(true);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    let cancelled = false;
    let ctx: ReturnType<typeof gsap.context> | undefined;
    let rafId = 0;
    let loopRunning = false;
    let io: IntersectionObserver | undefined;
    let restoreLenisDuration: (() => void) | undefined;

    const lines = [line1Ref.current, line2Ref.current, line3Ref.current, line4Ref.current];

    const setup = () => {
      if (cancelled) return;
      const duration = video.duration;
      if (!duration || !isFinite(duration)) return;

      ctx = gsap.context(() => {
        if (reducedMotion) {
          // Reduced motion: no pin, no scrub — show a static first frame and
          // let every text block simply be visible and stacked normally.
          video.currentTime = 0;
          gsap.set(lines.filter(Boolean), { clipPath: "none", opacity: 1 });
          return;
        }

        // Lenis's own scroll-deceleration (duration: 1.1s site-wide, see
        // SmoothScroll.tsx) sits *upstream* of everything in this file: it
        // keeps easing `window.scrollY` toward its target for over a
        // second after a wheel gesture ends, so ScrollTrigger — and this
        // component's own rAF interpolation, however tightly tuned — is
        // always chasing an already-lagging number. Measured directly (a
        // real wheel scroll, sampled every frame): with Lenis's default
        // duration, the video kept drifting for ~900ms after the last
        // input; with Lenis's duration temporarily dropped to near-native,
        // it settled to >99% of target within ~55ms. `options.duration` is
        // public, mutable state, so instead of removing Lenis (which the
        // rest of the site's pinned chapters are tuned around) this drops
        // it only while the user is inside the video's pinned range, and
        // restores the site-wide value the moment they leave it either way.
        const useFastLenis = () => {
          const lenis = window.__lenis;
          if (!lenis || restoreLenisDuration) return;
          const original = lenis.options.duration;
          lenis.options.duration = 0.2;
          restoreLenisDuration = () => {
            lenis.options.duration = original;
            restoreLenisDuration = undefined;
          };
        };

        const master = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            // 600% (was 400%): the same wheel input now produces about a
            // third less video-time progression per pixel scrolled — a
            // deliberate, moderate stretch (not an arbitrary huge number)
            // aimed at "explore it slowly," not "scroll forever to get
            // through it." The text-reveal windows below are fractions of
            // this same 0-1 range, so they redistribute proportionally
            // with no separate tuning needed.
            end: "+=600%",
            // No GSAP-side lag: the rAF loop below is the only smoothing
            // layer (see file-level comment for why stacking two was the
            // problem with the old sparsely-keyframed source).
            scrub: true,
            pin: true,
            anticipatePin: 1,
            onEnter: useFastLenis,
            onEnterBack: useFastLenis,
            onLeave: () => restoreLenisDuration?.(),
            onLeaveBack: () => {
              restoreLenisDuration?.();
              desiredVideoTime.current = 0;
              currentInterpolatedTime.current = 0;
              video.currentTime = 0;
            },
          },
          defaults: { ease: "none" },
        });

        master.fromTo(
          desiredVideoTime,
          { current: 0 },
          {
            current: duration,
            duration: 1,
          },
          0
        );

        // The only thing that ever writes to video.currentTime: eases
        // currentInterpolatedTime toward whatever desiredVideoTime is right
        // now, once per animation frame, independent of how often (or how
        // erratically) the scroll/scrub tween itself ticks. Threshold is
        // half a frame at 60fps — tight enough that no visible frame is
        // skipped, loose enough to not reissue a seek for a sub-visible
        // change. Lerp factor 0.42 settles to within ~2% of the target in
        // about six frames (~100ms at 60fps) — fast enough that the video
        // doesn't keep drifting once scrolling has actually stopped, but
        // still enough to absorb per-frame scroll jitter into a smooth
        // sweep instead of a raw 1:1 copy of every tick's target.
        const SEEK_THRESHOLD = 1 / 120;
        const LERP_FACTOR = 0.42;
        const tick = () => {
          if (cancelled) return;
          const desired = desiredVideoTime.current;
          const current = currentInterpolatedTime.current;
          const delta = desired - current;
          const next = Math.abs(delta) < 0.002 ? desired : current + delta * LERP_FACTOR;
          currentInterpolatedTime.current = next;
          if (Math.abs(video.currentTime - next) > SEEK_THRESHOLD) {
            video.currentTime = next;
          }
          if (nearViewportRef.current) {
            rafId = requestAnimationFrame(tick);
          } else {
            loopRunning = false;
          }
        };
        const startLoop = () => {
          if (loopRunning || cancelled) return;
          loopRunning = true;
          rafId = requestAnimationFrame(tick);
        };

        io = new IntersectionObserver(
          ([entry]) => {
            nearViewportRef.current = entry.isIntersecting;
            if (entry.isIntersecting) startLoop();
          },
          { rootMargin: "150% 0px 150% 0px" }
        );
        io.observe(section);

        master.to(hintRef.current, { opacity: 0, duration: 0.03, ease: "power1.out" }, 0.005);

        lines.forEach((el, i) => {
          if (!el) return;
          const [inStart, inEnd, outStart, outEnd] = TEXT_WINDOWS[i];
          master.fromTo(
            el,
            { clipPath: "inset(0 100% 0 0)", opacity: 0 },
            {
              clipPath: "inset(0 0% 0 0)",
              opacity: 1,
              duration: inEnd - inStart,
              ease: "power3.out",
            },
            inStart
          );
          master.to(
            el,
            {
              clipPath: "inset(0 0 0 100%)",
              opacity: 0,
              duration: Math.max(outEnd - outStart, 0.01),
              ease: "power3.in",
            },
            outStart
          );
        });
      }, section);

      // This section's pin-spacer is inserted asynchronously (only once the
      // video's metadata has loaded), which happens after every later
      // chapter has already mounted and measured its own ScrollTrigger
      // start/end against a shorter, pre-pin-spacer document. Without this,
      // every pinned section below the video ends up offset by the height
      // of this one. Refreshing here recalculates all of them against the
      // now-correct layout.
      ScrollTrigger.refresh();
    };

    if (video.readyState >= 1) {
      setup();
    } else {
      video.addEventListener("loadedmetadata", setup, { once: true });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      io?.disconnect();
      restoreLenisDuration?.();
      video.removeEventListener("loadedmetadata", setup);
      ctx?.revert();
    };
  }, [reducedMotion]);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-void"
    >
      {/*
        The source file's pixel buffer is natively portrait (1080x1920) with
        no rotation flag in its container, but every frame's actual content
        is landscape footage sideways in that buffer. rotate(-90deg) inside a
        CSS size query container swaps it back to its true 16:9 framing —
        `cqw`/`cqh` let the pre-rotation box borrow the *opposite* axis of
        the frame's own size, which is exactly what undoing a 90 degree turn
        requires.
      */}
      <div
        className="relative"
        style={{
          width: "min(100%, calc(100vh * 16 / 9))",
          aspectRatio: "16 / 9",
          margin: "auto",
          containerType: "size",
        }}
      >
        <video
          ref={videoRef}
          className="absolute left-1/2 top-1/2"
          style={{
            height: "100cqw",
            width: "100cqh",
            transform: "translate(-50%, -50%) rotate(-90deg)",
            transformOrigin: "center",
          }}
          src="/videos/gta6_scroll_optimized.mp4"
          muted
          playsInline
          preload="auto"
          aria-label={t("line4")}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(3,3,3,0.55) 0%, rgba(3,3,3,0) 22%, rgba(3,3,3,0) 68%, rgba(3,3,3,0.75) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 0 min(14vw,180px) rgba(3,3,3,0.7)" }}
        />
        <div className="grain pointer-events-none absolute inset-0" />
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between px-6 py-[10%] sm:px-14">
        <div className="flex items-start justify-between">
          <div ref={line1Ref} className="opacity-0" style={{ clipPath: "inset(0 100% 0 0)" }}>
            <span
              className="font-display text-paper"
              style={{ fontSize: "clamp(1.6rem, 4vw, 2.8rem)" }}
            >
              {t("line1")}
            </span>
          </div>
          <div
            ref={line3Ref}
            className="text-right opacity-0"
            style={{ clipPath: "inset(0 100% 0 0)" }}
          >
            <span
              className="font-display text-mist"
              style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)" }}
            >
              {t("line3")}
            </span>
          </div>
        </div>

        <div
          ref={line2Ref}
          className="self-center opacity-0"
          style={{ clipPath: "inset(0 100% 0 0)" }}
        >
          <span
            className="font-display text-gradient-vice"
            style={{ fontSize: "clamp(3.5rem, 13vw, 10rem)" }}
          >
            {t("line2")}
          </span>
        </div>

        <div
          ref={line4Ref}
          className="self-center text-center opacity-0"
          style={{ clipPath: "inset(0 100% 0 0)" }}
        >
          <span
            className="font-display text-outline"
            style={{ fontSize: "clamp(1.6rem, 5vw, 3.5rem)" }}
          >
            {t("line4")}
          </span>
        </div>
      </div>

      <div
        ref={hintRef}
        className="absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-2 text-mist-dim"
      >
        <span className="text-[10px] uppercase tracking-[0.35em]">
          {t("scrollHint")}
        </span>
        <span className="h-8 w-px animate-pulse bg-current" />
      </div>
    </section>
  );
}
