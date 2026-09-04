"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { TRAILERS } from "@/config/game";
import Eyebrow from "@/components/ui/Eyebrow";
import { formatDate } from "@/lib/formatDate";

export default function TrailerCinema() {
  const t = useTranslations();
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const trailer = TRAILERS[active];

  const select = (i: number) => {
    if (i === active) return;
    setActive(i);
    setPlaying(false);
  };

  return (
    <section id="trailers" className="relative bg-void px-6 py-28 sm:px-14">
      <Eyebrow tone="cyan">{t("trailers.kicker")}</Eyebrow>
      <h2
        className="font-display mt-6 text-paper"
        style={{ fontSize: "clamp(2.6rem, 8vw, 6rem)" }}
      >
        {t("trailers.heading")}
      </h2>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="relative aspect-video w-full overflow-hidden bg-charcoal">
          <AnimatePresence mode="wait">
            {playing ? (
              <motion.iframe
                key={`frame-${trailer.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${trailer.youtubeId}?autoplay=1&rel=0`}
                title={t(trailer.titleKey)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <motion.button
                key={`poster-${trailer.id}`}
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => setPlaying(true)}
                data-cursor="play"
                className="group absolute inset-0 h-full w-full cursor-pointer"
                aria-label={t("trailers.watchOn")}
              >
                <Image
                  src={`https://i.ytimg.com/vi/${trailer.youtubeId}/maxresdefault.jpg`}
                  alt={t(trailer.titleKey)}
                  fill
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-void/30 transition-colors group-hover:bg-void/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-paper/50 bg-void/50 backdrop-blur-sm transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
                    <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-paper sm:h-7 sm:w-7">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </div>
                <div className="absolute left-4 top-4 text-[10px] uppercase tracking-[0.3em] text-paper/80 sm:left-6 sm:top-6">
                  {t("trailers.select")} {String(trailer.index).padStart(2, "0")}
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-1">
          {TRAILERS.map((tr, i) => {
            const isActive = i === active;
            return (
              <button
                key={tr.id}
                type="button"
                onClick={() => select(i)}
                className={`group flex items-center gap-4 border-b border-line py-4 text-left transition-colors cursor-pointer ${
                  isActive ? "text-paper" : "text-mist-dim hover:text-mist"
                }`}
              >
                <span className="font-display text-2xl">
                  {String(tr.index).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">{t(tr.titleKey)}</span>
                  <span className="block text-[11px] text-mist-dim">
                    {formatDate(tr.date)}
                  </span>
                </span>
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    isActive ? "bg-sunset-pink" : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={trailer.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-8 max-w-2xl text-mist"
        >
          {t(trailer.descriptionKey)}
        </motion.p>
      </AnimatePresence>
    </section>
  );
}
