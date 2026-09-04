"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "@/lib/gsap";
import { scrollToSection } from "@/lib/scroll";

const LINKS: { key: string; id: string }[] = [
  { key: "world", id: "world" },
  { key: "trailers", id: "trailers" },
  { key: "characters", id: "characters" },
  { key: "gallery", id: "gallery" },
  { key: "release", id: "release" },
  { key: "hardware", id: "hardware" },
  { key: "timeline", id: "timeline" },
];

export default function Navbar() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (y !== last) {
        setScrolled(y > window.innerHeight * 0.6);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuRef.current) return;
    if (open) {
      document.body.style.overflow = "hidden";
      gsap.fromTo(
        menuRef.current,
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power4.inOut" }
      );
      gsap.fromTo(
        ".mobile-link",
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.06,
          ease: "power3.out",
          delay: 0.15,
        }
      );
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${
          scrolled
            ? "bg-void/70 backdrop-blur-md border-b border-line"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => go("top")}
            className="group flex items-baseline gap-2 cursor-pointer"
            aria-label={t("home")}
          >
            <span className="font-display text-2xl text-paper transition-colors group-hover:text-sunset-pink">
              {t("brand")}
            </span>
            <span className="hidden text-[9px] tracking-[0.35em] text-mist-dim sm:inline">
              {t("brandSub")}
            </span>
          </button>

          <nav className="hidden items-center gap-7 lg:flex">
            {LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => go(link.id)}
                className="relative text-[11px] font-medium uppercase tracking-[0.2em] text-mist transition-colors duration-300 hover:text-paper cursor-pointer after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-sunset-pink after:transition-all after:duration-300 hover:after:w-full"
              >
                {t(link.key)}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] cursor-pointer lg:hidden"
            aria-label={open ? t("close") : t("menu")}
            aria-expanded={open}
          >
            <span
              className={`h-px w-5 bg-paper transition-transform duration-300 ${
                open ? "translate-y-[3px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-5 bg-paper transition-transform duration-300 ${
                open ? "-translate-y-[3px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      <div
        ref={menuRef}
        className="fixed inset-0 z-40 flex flex-col justify-center bg-void px-8 lg:hidden"
        style={{ clipPath: "inset(0% 0% 100% 0%)", pointerEvents: open ? "auto" : "none" }}
        aria-hidden={!open}
      >
        <nav className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <div key={link.id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => go(link.id)}
                className="mobile-link font-display text-5xl text-paper transition-colors hover:text-sunset-pink cursor-pointer"
              >
                {t(link.key)}
              </button>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
