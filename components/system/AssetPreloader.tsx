"use client";

import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { MODEL_URL } from "@/lib/modelConstants";

/**
 * Mounted once from the root layout — see app/layout.tsx — so this runs the
 * instant the app boots, not when the visitor scrolls near the 3D chapter.
 *
 * This file is a *static* import from the root layout, deliberately not
 * behind `next/dynamic`: the whole point is that the GLTFLoader fetch+parse
 * starts while the visitor is still looking at the preloader/opening video,
 * giving it the entire rest of the opening experience as a head start
 * instead of only the last stretch of scroll before the chapter itself.
 *
 * `useGLTF.preload` only kicks off the network request and JS-side parse
 * (geometry/material objects) — it does not touch a GPU. There is no
 * `<Canvas>` here and this component renders nothing, so this adds zero
 * WebGL/GPU cost at startup; ModelChapter.tsx still fully controls when a
 * renderer actually exists and when it's allowed to draw a frame.
 *
 * The call is inside an effect, not at module scope, specifically because
 * this component is unconditionally part of the tree Next.js server-renders
 * — a module-scope call here would also run during SSR. `PosterModel.tsx`
 * gets away with a module-scope preload call precisely because it's only
 * ever reached through conditional client rendering that SSR never
 * satisfies; this component has no such guard, so the effect is what makes
 * it SSR-safe.
 *
 * drei's loader cache is keyed by the exact URL string, and MODEL_URL is
 * the single shared constant every other model-loading call site (the
 * `<link rel="preload">` in app/layout.tsx, and PosterModel's own
 * useGLTF(MODEL_URL) at render time) also uses — so this is the same cache
 * entry they'll all hit, not a second one.
 */
export default function AssetPreloader() {
  useEffect(() => {
    useGLTF.preload(MODEL_URL);
  }, []);

  return null;
}
