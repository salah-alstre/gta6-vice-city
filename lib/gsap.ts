"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Debug-only inspection hooks (matches the existing window.__lenis
  // pattern) — lets ScrollTrigger.getAll() etc. be checked from the console
  // without a source build step. No app code reads these.
  window.__gsap = gsap;
  window.__ScrollTrigger = ScrollTrigger;
}

export { gsap, ScrollTrigger, useGSAP };
