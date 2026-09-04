import type Lenis from "lenis";
import type gsapType from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    __lenis?: Lenis;
    __gsap?: typeof gsapType;
    __ScrollTrigger?: typeof ScrollTriggerType;
  }
}

export {};
