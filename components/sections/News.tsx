"use client";

import { useTranslations } from "next-intl";
import Eyebrow from "@/components/ui/Eyebrow";
import { NEWS_ITEMS } from "@/data/news";

export default function News() {
  const t = useTranslations("news");

  return (
    <section className="relative bg-void px-6 py-28 sm:px-14">
      <Eyebrow tone="pink">{t("kicker")}</Eyebrow>
      <h2
        className="font-display mt-6 text-paper"
        style={{ fontSize: "clamp(2.4rem, 7vw, 5rem)" }}
      >
        {t("heading")}
      </h2>

      <div className="mt-14 divide-y divide-line border-t border-line">
        {NEWS_ITEMS.map((item) => (
          <a
            key={item.id}
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group grid gap-2 py-8 transition-colors sm:grid-cols-[140px_1fr_auto] sm:items-center sm:gap-6"
          >
            <span className="text-[11px] uppercase tracking-[0.25em] text-mist-dim">
              {t(`items.${item.id}.date`)}
            </span>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-sunset-pink">
                {t(`items.${item.id}.category`)}
              </span>
              <h3 className="mt-1 text-lg text-paper transition-colors group-hover:text-sunset-pink sm:text-xl">
                {t(`items.${item.id}.title`)}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist">
                {t(`items.${item.id}.description`)}
              </p>
            </div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-mist-dim underline-offset-4 group-hover:text-paper group-hover:underline">
              {t("readMore")} →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
