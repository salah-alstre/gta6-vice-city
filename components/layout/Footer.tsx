"use client";

import { useTranslations } from "next-intl";
import { scrollToSection } from "@/lib/scroll";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="relative border-t border-line bg-void px-6 pb-8 pt-16 sm:px-10">
      <div className="mx-auto grid max-w-[1600px] gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <span className="font-display text-3xl text-paper">
            {tNav("brand")}
          </span>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist">
            {t("brand")}
          </p>
          <button
            type="button"
            onClick={() => scrollToSection("top")}
            className="mt-6 text-[11px] uppercase tracking-[0.25em] text-mist-dim transition-colors hover:text-sunset-pink cursor-pointer"
          >
            {t("backToTop")} ↑
          </button>
        </div>

        <div>
          <h3 className="text-[11px] uppercase tracking-[0.3em] text-mist-dim">
            {t("credits")}
          </h3>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-mist">
            <li>{t("modelCredit")}</li>
            <li>{t("sourceCredit")}</li>
            <li>{t("builtWith")}</li>
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] uppercase tracking-[0.3em] text-orange">
            {t("disclaimerTitle")}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-mist">
            {t("disclaimer")}
          </p>
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-[1600px] items-center justify-between border-t border-line pt-6 text-[10px] uppercase tracking-[0.2em] text-mist-dim">
        <span>© {new Date().getFullYear()} — Fan Project</span>
        <span>Vice City</span>
      </div>
    </footer>
  );
}
