"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import Eyebrow from "@/components/ui/Eyebrow";
import { GALLERY_IMAGES } from "@/data/gallery";

export default function Gallery() {
  const t = useTranslations("gallery");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % GALLERY_IMAGES.length));
      if (e.key === "ArrowLeft")
        setOpenIndex((i) => (i === null ? i : (i - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex]);

  return (
    <section id="gallery" className="relative bg-void px-6 py-28 sm:px-14">
      <Eyebrow tone="violet">{t("kicker")}</Eyebrow>
      <h2
        className="font-display mt-6 text-paper"
        style={{ fontSize: "clamp(2.6rem, 8vw, 6rem)" }}
      >
        {t("heading")}
      </h2>

      <div className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3 [column-fill:balance]">
        {GALLERY_IMAGES.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            data-cursor="view"
            className={`group relative mb-4 block w-full cursor-pointer overflow-hidden break-inside-avoid ${
              i % 5 === 0 ? "aspect-[4/5]" : "aspect-[16/10]"
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-void/0 transition-colors duration-300 group-hover:bg-void/10" />
          </button>
        ))}
      </div>

      <p className="mt-8 text-[10px] uppercase tracking-[0.25em] text-mist-dim">
        {t("sourceNote")}
      </p>

      <AnimatePresence>
        {openIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-void/95 p-4 backdrop-blur-sm sm:p-10"
            onClick={() => setOpenIndex(null)}
          >
            <motion.div
              key={GALLERY_IMAGES[openIndex].id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="relative h-full max-h-[85vh] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={GALLERY_IMAGES[openIndex].src}
                alt={GALLERY_IMAGES[openIndex].alt}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </motion.div>
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              className="absolute right-5 top-5 text-2xl text-paper/80 hover:text-paper cursor-pointer"
              aria-label="Close"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
