"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";
import { onLayoutReady } from "@/lib/layoutReady";

export default function FinalMoment() {
  const t = useTranslations("final");
  const sectionRef = useRef<HTMLDivElement>(null);

  // Deferred to onLayoutReady — see lib/layoutReady.ts and Intro.tsx.
  useGSAP(
    () => {
      return onLayoutReady(() => setup());

      function setup() {
      if (!sectionRef.current) return;
      gsap.set(".final-line", { clipPath: "inset(0 0 100% 0)" });
      gsap.set(".final-glow", { opacity: 0 });

      gsap.to(".final-glow", {
        opacity: 1,
        duration: 1.2,
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });
      gsap.to(".final-line", {
        clipPath: "inset(0 0 0% 0)",
        duration: 1.1,
        stagger: 0.15,
        ease: "power4.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
      });
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-void px-6 text-center"
    >
      <div
        className="final-glow pointer-events-none absolute left-1/2 top-1/2 h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,61,129,0.22), rgba(255,122,48,0.1) 50%, transparent 75%)",
        }}
      />
      <div className="relative z-10 overflow-hidden">
        <h2 className="font-display leading-[0.88]">
          <span
            className="final-line block text-mist"
            style={{ fontSize: "clamp(2.2rem, 7vw, 5rem)" }}
          >
            {t("line1")}
          </span>
          <span
            className="final-line block text-gradient-vice"
            style={{ fontSize: "clamp(4rem, 15vw, 11rem)" }}
          >
            {t("line2")}
          </span>
        </h2>
      </div>
      <span className="relative z-10 mt-8 text-sm uppercase tracking-[0.3em] text-mist-dim">
        {t("date")}
      </span>
    </section>
  );
}
