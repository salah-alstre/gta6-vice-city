"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Eyebrow from "@/components/ui/Eyebrow";
import { REQUIREMENT_ESTIMATES } from "@/data/requirements";

export default function Requirements() {
  const t = useTranslations("requirements");
  const [showEstimates, setShowEstimates] = useState(false);

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

        <div className="mt-10 border border-line p-6 sm:p-8">
          <span className="font-display text-3xl text-mist-dim">{t("notAnnounced")}</span>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist">{t("explanation")}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowEstimates((v) => !v)}
          className="mt-8 cursor-pointer text-[11px] uppercase tracking-[0.25em] text-orange underline underline-offset-4 hover:text-warm-yellow"
        >
          {t("estimateToggle")}
        </button>

        {showEstimates && (
          <div className="mt-8">
            <div className="inline-block bg-orange/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-orange">
              {t("estimateLabel")}
            </div>
            <p className="mt-3 max-w-xl text-xs leading-relaxed text-mist-dim">
              {t("estimateNote")}
            </p>

            <div className="mt-8 overflow-x-auto">
              <div className="grid gap-6">
                {REQUIREMENT_ESTIMATES.map((tier) => (
                  <div key={tier.key} className="grid grid-cols-2 gap-4 border-b border-line/60 pb-6 sm:grid-cols-5">
                    <div className="col-span-2 font-display text-lg text-paper sm:col-span-5">
                      {t(tier.key)}
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-mist-dim">{t("os")}</div>
                      <div className="mt-1 text-mist">{tier.os}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-mist-dim">{t("cpu")}</div>
                      <div className="mt-1 text-mist">{tier.cpu}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-mist-dim">{t("gpu")}</div>
                      <div className="mt-1 text-mist">{tier.gpu}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-mist-dim">{t("ram")}</div>
                      <div className="mt-1 text-mist">{tier.ram}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-mist-dim">{t("storage")}</div>
                      <div className="mt-1 text-mist">{tier.storage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
