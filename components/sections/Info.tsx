"use client";

import { useTranslations } from "next-intl";
import Eyebrow from "@/components/ui/Eyebrow";

const ROWS: [string, string][] = [
  ["developer", "developerValue"],
  ["publisher", "publisherValue"],
  ["genre", "genreValue"],
  ["setting", "settingValue"],
  ["protagonists", "protagonistsValue"],
  ["release", "releaseValue"],
  ["platforms", "platformsValue"],
  ["pc", "pcValue"],
  ["modes", "modesValue"],
];

export default function Info() {
  const t = useTranslations("info");

  return (
    <section className="relative bg-void px-6 py-28 sm:px-14">
      <div className="mx-auto max-w-4xl">
        <Eyebrow>{t("kicker")}</Eyebrow>
        <h2
          className="font-display mt-6 text-paper"
          style={{ fontSize: "clamp(2.4rem, 7vw, 5rem)" }}
        >
          {t("heading")}
        </h2>

        <dl className="mt-14 divide-y divide-line border-t border-line">
          {ROWS.map(([labelKey, valueKey]) => {
            const notAnnounced = t(valueKey).toLowerCase().includes("not officially announced");
            return (
              <div
                key={labelKey}
                className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-[220px_1fr] sm:items-baseline sm:gap-6"
              >
                <dt className="text-[11px] uppercase tracking-[0.25em] text-mist-dim">
                  {t(labelKey)}
                </dt>
                <dd
                  className={`font-display text-xl sm:text-2xl ${
                    notAnnounced ? "text-mist-dim" : "text-paper"
                  }`}
                >
                  {t(valueKey)}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
