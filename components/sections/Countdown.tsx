"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { GAME_RELEASE_DATE } from "@/config/game";
import { useCountdown } from "@/hooks/useCountdown";
import { gsap } from "@/lib/gsap";
import Eyebrow from "@/components/ui/Eyebrow";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function usePunch(value: number) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value && ref.current) {
      gsap.fromTo(
        ref.current,
        { y: -6, opacity: 0.4 },
        { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" }
      );
    }
    prev.current = value;
  }, [value]);

  return ref;
}

export default function Countdown() {
  const t = useTranslations("countdown");
  const value = useCountdown(GAME_RELEASE_DATE);
  const { days, hours, minutes, seconds, done } = value ?? {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    done: false,
  };

  const hoursRef = usePunch(hours);
  const minutesRef = usePunch(minutes);
  const secondsRef = usePunch(seconds);
  const daysRef = usePunch(days);

  if (!value) {
    // Server/first-client-paint placeholder — deliberately blank rather
    // than a real countdown so there is nothing for hydration to mismatch
    // against (the server has no reliable "now").
    return (
      <section
        id="release"
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-void px-6 py-32 text-center"
        aria-hidden="true"
      />
    );
  }

  return (
    <section
      id="release"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-void px-6 py-32 text-center"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(155,77,255,0.28), rgba(255,61,129,0.12) 50%, transparent 72%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <Eyebrow tone="violet">{t("kicker")}</Eyebrow>

        {done ? (
          <p
            className="mt-8 font-display text-gradient-vice"
            style={{ fontSize: "clamp(2.4rem, 7vw, 5rem)" }}
          >
            {t("live")}
          </p>
        ) : (
          <>
            <div className="mt-6 flex flex-col items-center leading-[0.85]">
              <span
                ref={daysRef}
                className="font-display text-gradient-vice"
                style={{ fontSize: "clamp(6rem, 22vw, 16rem)" }}
              >
                {days}
              </span>
              <span
                className="font-display text-paper"
                style={{ fontSize: "clamp(1.4rem, 4vw, 2.6rem)" }}
              >
                {t("days")} {t("until")}
              </span>
            </div>

            <div className="mt-12 flex items-baseline gap-3 font-display text-mist sm:gap-5">
              <span ref={hoursRef} style={{ fontSize: "clamp(2rem, 6vw, 3.6rem)" }}>
                {pad(hours)}
              </span>
              <span className="text-violet">:</span>
              <span ref={minutesRef} style={{ fontSize: "clamp(2rem, 6vw, 3.6rem)" }}>
                {pad(minutes)}
              </span>
              <span className="text-violet">:</span>
              <span ref={secondsRef} style={{ fontSize: "clamp(2rem, 6vw, 3.6rem)" }}>
                {pad(seconds)}
              </span>
            </div>
            <div className="mt-3 flex gap-8 text-[10px] uppercase tracking-[0.3em] text-mist-dim sm:gap-11">
              <span>{t("hours")}</span>
              <span>{t("minutes")}</span>
              <span>{t("seconds")}</span>
            </div>
          </>
        )}

        <div className="mt-14 flex flex-col items-center gap-2 border-t border-line pt-6 text-xs uppercase tracking-[0.2em] text-mist-dim">
          <span>{t("platforms")}</span>
          <span className="text-[10px] normal-case tracking-normal text-mist-dim/70">
            {t("sourceNote")}
          </span>
        </div>
      </div>
    </section>
  );
}
