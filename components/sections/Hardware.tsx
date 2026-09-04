"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import Eyebrow from "@/components/ui/Eyebrow";

const DEVICES = ["ps5", "ps5pro", "seriesx", "seriess"] as const;

// On-brand accents rather than each platform's own brand colors — this is a
// fan site skinned in the Vice City palette throughout, not a retailer page.
const ACCENTS: Record<(typeof DEVICES)[number], string> = {
  ps5: "#ff3d81",
  ps5pro: "#9b4dff",
  seriesx: "#5fae6f",
  seriess: "#2dd4cf",
};

export default function Hardware() {
  const t = useTranslations("hardware");
  const [active, setActive] = useState<(typeof DEVICES)[number]>("ps5");
  const accent = ACCENTS[active];

  return (
    <section id="hardware" className="relative bg-void px-6 py-24 sm:px-14">
      <Eyebrow tone="orange">{t("kicker")}</Eyebrow>
      <h2
        className="font-display mt-6 text-paper"
        style={{ fontSize: "clamp(2.4rem, 7vw, 5rem)" }}
      >
        {t("heading")}
      </h2>

      <div className="mt-10 grid gap-1 border-y border-line sm:grid-cols-4">
        {DEVICES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setActive(d)}
            className="group relative cursor-pointer overflow-hidden px-4 py-4 text-start transition-colors"
          >
            <span
              className="absolute inset-x-0 bottom-0 h-[2px] origin-left transition-transform duration-300"
              style={{
                background: ACCENTS[d],
                transform: active === d ? "scaleX(1)" : "scaleX(0)",
              }}
            />
            <span className="block text-[10px] uppercase tracking-[0.25em] text-mist-dim">
              {t(`${d}.tier`)}
            </span>
            <span
              className={`mt-1 block font-display text-lg transition-colors sm:text-xl ${
                active === d ? "text-paper" : "text-mist-dim group-hover:text-mist"
              }`}
            >
              {t(`${d}.name`)}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,26rem)_1fr]"
        >
          {/* Device presence: an abstract console glyph rather than product
             photography (no license to render Sony/Microsoft hardware),
             glowing in that platform's accent so the tab switch reads as a
             real change, not just new text. */}
          <div className="relative flex h-56 items-center justify-center sm:h-64">
            <div
              className="absolute h-40 w-40 rounded-full blur-[70px] sm:h-48 sm:w-48"
              style={{ background: accent, opacity: 0.35 }}
            />
            <svg
              viewBox="0 0 200 140"
              className="relative h-32 w-auto sm:h-40"
              aria-hidden="true"
            >
              <rect
                x="10"
                y="45"
                width="180"
                height="60"
                rx="30"
                fill="none"
                stroke={accent}
                strokeWidth="2.5"
              />
              <rect x="30" y="65" width="50" height="20" rx="4" fill={accent} opacity="0.85" />
              <circle cx="150" cy="75" r="9" fill="none" stroke={accent} strokeWidth="2.5" />
              <circle cx="172" cy="75" r="5" fill={accent} />
            </svg>
          </div>

          <div>
            <span
              className="text-[11px] uppercase tracking-[0.3em]"
              style={{ color: accent }}
            >
              {t(`${active}.tier`)}
            </span>
            <h3
              className="font-display mt-2 text-gradient-vice"
              style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)" }}
            >
              {t(`${active}.name`)}
            </h3>

            <div className="mt-6 grid grid-cols-3 gap-6 border-t border-line pt-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-mist-dim">
                  {t("bestFor")}
                </div>
                <div className="mt-1 text-sm leading-snug text-paper sm:text-base">
                  {t(`${active}.bestFor`)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-mist-dim">
                  {t("storage")}
                </div>
                <div className="mt-1 text-sm leading-snug text-paper sm:text-base">
                  {t(`${active}.storage`)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-mist-dim">
                  {t("price")}
                </div>
                <div className="mt-1 text-sm leading-snug text-paper sm:text-base">
                  {t(`${active}.price`)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="mt-10 max-w-xl text-sm leading-relaxed text-mist-dim">{t("note")}</p>
    </section>
  );
}
