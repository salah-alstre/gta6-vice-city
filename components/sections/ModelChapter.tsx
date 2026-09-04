"use client";

import { Suspense, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import * as THREE from "three";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { onLayoutReady } from "@/lib/layoutReady";
import type { ModelState } from "@/components/three/Rig";

// No `ssr: false` here: this chunk is only ever rendered once `everSeen`
// flips true on the client (see below), which never happens during SSR or
// the client's first paint, so the code-splitting is already SSR-safe
// without it.
const ModelCanvas = dynamic(() => import("@/components/three/ModelCanvas"));

export default function ModelChapter() {
  const t = useTranslations("model");
  const sectionRef = useRef<HTMLDivElement>(null);
  // `everSeen` latches true the first time the chapter comes near the
  // viewport and then stays true — this is what mounts the Canvas (and
  // therefore starts the WebGL context + GLTFLoader parse) once, ahead of
  // the pin actually engaging.
  const [inViewRef, , everSeen] = useInView<HTMLDivElement>({
    rootMargin: "50% 0px 50% 0px",
  });
  const reducedMotion = useReducedMotion();

  // The render loop's on/off switch used to be driven by this same
  // IntersectionObserver's `inView` value — but IntersectionObserver
  // callbacks are async and browser-scheduled, while the pin below engages
  // synchronously the instant scroll crosses its start. Under a fast scroll,
  // that gap is exactly the window where the section is pinned on screen
  // but frameloop="never" — a black hole where the model should be. Driving
  // `canvasActive` from the pin's own onEnter/onLeave instead ties it to the
  // *same* scroll-driven update that engages the pin, so there is no gap by
  // construction — see the ScrollTrigger.create call below.
  const [canvasActive, setCanvasActive] = useState(false);
  // Belt-and-suspenders for the mount itself, not just the render loop: on
  // an extreme scroll jump (a flung scrollbar drag, a huge trackpad flick)
  // it's *possible* for the pin's synchronous onEnter to fire before the
  // separate IntersectionObserver behind `everSeen` has run even once. If
  // that happens, force the mount right there instead of waiting on it.
  const [forceMounted, setForceMounted] = useState(false);
  const shouldMountCanvas = everSeen || forceMounted;

  // The GLB fetch itself starts at app boot, not here — see
  // components/system/AssetPreloader.tsx, mounted from the root layout. By
  // the time `shouldMountCanvas` flips true, useGLTF(MODEL_URL) inside
  // PosterModel almost always hits that already-warm cache entry instead of
  // starting a fresh fetch.

  // Rotation values here are small offsets from "face-on" — PosterModel
  // already bakes in the -90° correction that brings the plaque's face
  // normal to the camera, so the choreography only ever has to add gentle,
  // naturalistic tilt/turn on top of an already-legible starting pose.
  const stateRef = useRef<ModelState>({
    position: new THREE.Vector3(1.3, 0.15, -2.6),
    rotation: new THREE.Euler(0.12, -0.4, 0.02),
    scale: 0.4,
    sweep: -0.6,
    rimIntensity: 0.6,
  });

  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const line4Ref = useRef<HTMLSpanElement>(null);

  const setRefs = (el: HTMLDivElement | null) => {
    sectionRef.current = el;
    inViewRef.current = el;
  };

  // Setup is deferred to `onLayoutReady` — see lib/layoutReady.ts for why:
  // a pin created before the scroll-video chapter's async pin-spacer lands
  // caches a start/end measured against a too-short document, and
  // ScrollTrigger.refresh() does not correct it after the fact. The WebGL
  // canvas mounts separately and lazily (`everSeen` above); until it exists
  // these tweens just update plain numbers nobody is reading yet.
  useGSAP(
    () => {
      if (reducedMotion || !sectionRef.current) return;

      return onLayoutReady(() => setup());

      function setup() {
      if (!sectionRef.current) return;
      const s = stateRef.current;
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

      // ENTRY (0) -> APPROACH (~0.32) -> HERO (~0.55, the visual anchor,
      // occupying roughly half the frame) -> EXIT (1, large and swept off
      // to the side as the next chapter's countdown resolves behind it).
      // Every phase keeps the plaque recognizable — never fully dark, never
      // spinning, only ever a gentle turn layered on the face-on baseline.
      tl.to(s.position, { x: 0.55, y: 0.08, z: -0.9, duration: 0.32, ease: "power2.out" }, 0)
        .to(s.rotation, { x: 0.06, y: -0.16, z: 0.01, duration: 0.32, ease: "power2.out" }, 0)
        .to(s, { scale: 0.62, rimIntensity: 1.0, duration: 0.32, ease: "power2.out" }, 0)
        .to(s, { sweep: -0.1, duration: 0.32 }, 0)

        .to(s.position, { x: 0.32, y: 0, z: 0.35, duration: 0.23, ease: "power1.inOut" }, 0.32)
        .to(s.rotation, { x: 0.02, y: 0.04, z: 0, duration: 0.23, ease: "power1.inOut" }, 0.32)
        .to(s, { scale: 0.82, rimIntensity: 1.3, duration: 0.23, ease: "power1.inOut" }, 0.32)
        .to(s, { sweep: 0.35, duration: 0.23 }, 0.32)

        // Hero hold: the plaque is the visual anchor for a beat before it
        // starts moving toward the exit — a real pause, not an instant hop.
        .to(s.rotation, { y: -0.05, duration: 0.15, ease: "sine.inOut" }, 0.55)

        .to(s.position, { x: 1.1, y: 0.22, z: 1.7, duration: 0.2, ease: "power2.in" }, 0.7)
        .to(s.rotation, { x: -0.06, y: 0.38, z: 0.03, duration: 0.2, ease: "power2.in" }, 0.7)
        .to(s, { scale: 1.25, duration: 0.2, ease: "power2.in" }, 0.7)
        .to(s, { sweep: 0.8, duration: 0.2 }, 0.7)

        .to(s.position, { x: 2.1, y: -0.1, z: 3.4, duration: 0.1, ease: "power1.in" }, 0.9)
        .to(s.rotation, { x: -0.1, y: 0.7, z: 0.05, duration: 0.1 }, 0.9)
        .to(s, { scale: 1.7, rimIntensity: 0.4, duration: 0.1 }, 0.9);

      const lines = [line1Ref.current, line2Ref.current, line3Ref.current, line4Ref.current];
      const windows: [number, number, number, number][] = [
        [0.03, 0.1, 0.28, 0.32],
        [0.36, 0.44, 0.66, 0.72],
        [0.36, 0.44, 0.66, 0.72],
        [0.76, 0.83, 0.97, 1],
      ];
      lines.forEach((el, i) => {
        if (!el) return;
        const [inStart, inEnd, outStart, outEnd] = windows[i];
        tl.fromTo(
          el,
          { clipPath: "inset(0 100% 0 0)", opacity: 0 },
          { clipPath: "inset(0 0% 0 0)", opacity: 1, duration: inEnd - inStart, ease: "power3.out" },
          inStart
        ).to(
          el,
          { clipPath: "inset(0 0 0 100%)", opacity: 0, duration: outEnd - outStart, ease: "power3.in" },
          outStart
        );
      });

      // The pin lives on its own explicit ScrollTrigger that manually
      // drives the (paused) timeline's playhead from onUpdate, rather than
      // being bound as the tween's `scrollTrigger` option — deferring to
      // onLayoutReady is what actually fixes the pin engagement; this part
      // is just a clean way to keep the pin and the value tweening
      // decoupled.
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=300%",
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => tl.progress(self.progress),
        // Synchronous with the pin engaging/releasing — see the
        // `canvasActive` comment above for why this replaced the old
        // IntersectionObserver-driven `inView`.
        onEnter: () => {
          setForceMounted(true);
          setCanvasActive(true);
        },
        onEnterBack: () => {
          setForceMounted(true);
          setCanvasActive(true);
        },
        onLeave: () => setCanvasActive(false),
        onLeaveBack: () => setCanvasActive(false),
      });
      }
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  return (
    <section
      ref={setRefs}
      id="model"
      className="relative h-screen w-full overflow-hidden bg-void"
    >
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-[4vw]">
        <span
          ref={line2Ref}
          className="font-display text-outline opacity-0"
          style={{ fontSize: "clamp(3rem, 14vw, 11rem)", clipPath: "inset(0 100% 0 0)" }}
        >
          {t("line2")}
        </span>
        <span
          ref={line3Ref}
          className="font-display text-outline opacity-0"
          style={{ fontSize: "clamp(3rem, 14vw, 11rem)", clipPath: "inset(0 100% 0 0)" }}
        >
          {t("line3")}
        </span>
      </div>

      <div className="absolute inset-0 z-20">
        {shouldMountCanvas && !reducedMotion && (
          <Suspense fallback={<ModelFallback />}>
            <ModelCanvas stateRef={stateRef} active={canvasActive} />
          </Suspense>
        )}
        {reducedMotion && (
          <div className="flex h-full items-center justify-center">
            <span
              className="font-display text-gradient-vice"
              style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }}
            >
              {t("line3")}
            </span>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 z-30">
        <span
          ref={line1Ref}
          className="absolute left-6 top-[12%] font-display text-paper opacity-0 sm:left-12"
          style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", clipPath: "inset(0 100% 0 0)" }}
        >
          {t("line1")}
        </span>
        <span
          ref={line4Ref}
          className="absolute bottom-[14%] right-6 font-display text-mist opacity-0 sm:right-12"
          style={{ fontSize: "clamp(1.4rem, 3.4vw, 2.2rem)", clipPath: "inset(0 100% 0 0)" }}
        >
          {t("line4")}
        </span>
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-[9px] uppercase tracking-[0.2em] text-mist-dim">
          {t("credit")}
        </span>
      </div>
    </section>
  );
}

// Shown for however long the drei chunk (this specific dynamic import, not
// the GLB — see AssetPreloader.tsx) takes to resolve inside the Suspense
// boundary above. Reachable in practice only on a slow connection or a very
// fast scroll, since the GLB itself has had the whole opening experience as
// a head start by this point — but reachable is not the same as never, and
// a bare `null` here was exactly the "black pinned section" bug: nothing
// rendered, no way to tell it apart from something actually broken. A soft
// breathing glow reads as "arriving," not "stuck."
function ModelFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className="h-[28vh] w-[28vh] animate-pulse rounded-full blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,61,129,0.35), rgba(155,77,255,0.18) 55%, transparent 75%)",
        }}
      />
    </div>
  );
}
