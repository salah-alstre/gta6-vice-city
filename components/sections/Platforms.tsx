"use client";

import { useTranslations } from "next-intl";
import Eyebrow from "@/components/ui/Eyebrow";

export default function Platforms() {
  const t = useTranslations("platforms");
  const platforms = [
    { key: "ps5", confirmed: true },
    { key: "xsx", confirmed: true },
    { key: "pc", confirmed: false },
  ];

  return (
    <section className="relative bg-void px-6 py-28 sm:px-14">
      <Eyebrow tone="cyan">{t("kicker")}</Eyebrow>
      <h2
        className="font-display mt-6 text-paper"
        style={{ fontSize: "clamp(2.4rem, 7vw, 5rem)" }}
      >
        {t("heading")}
      </h2>

      <div className="mt-14 divide-y divide-line border-t border-line">
        {platforms.map((p) => (
          <div
            key={p.key}
            className="flex flex-col gap-2 py-8 sm:flex-row sm:items-center sm:justify-between"
          >
            <span
              className={`font-display ${p.confirmed ? "text-paper" : "text-mist-dim"}`}
              style={{ fontSize: "clamp(2rem, 6vw, 3.6rem)" }}
            >
              {t(p.key)}
            </span>
            <span
              className={`text-[11px] uppercase tracking-[0.3em] ${
                p.confirmed ? "text-cyan" : "text-mist-dim"
              }`}
            >
              {p.confirmed ? t("confirmed") : t("pcStatus")}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-8 max-w-xl text-sm leading-relaxed text-mist-dim">{t("note")}</p>
    </section>
  );
}
