"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { gsap, useGSAP } from "@/lib/gsap";
import { onLayoutReady } from "@/lib/layoutReady";
import Eyebrow from "@/components/ui/Eyebrow";

const CHARACTERS = [
  {
    id: "lucia",
    image: "/images/characters/lucia-caminos.jpg",
    tone: "text-sunset-pink",
  },
  {
    id: "jason",
    image: "/images/characters/jason-duval.jpg",
    tone: "text-cyan",
  },
] as const;

export default function Characters() {
  const t = useTranslations("characters");
  const sectionRef = useRef<HTMLDivElement>(null);

  // Deferred to onLayoutReady — see lib/layoutReady.ts and Intro.tsx. A
  // toggle-action trigger like this one (no scrub) doesn't visibly break the
  // same way a scrub does; a stale cached "start" just means it fires while
  // still off-screen, so the panels are already fully revealed with no
  // animation ever visible by the time the user scrolls here.
  useGSAP(
    () => {
      return onLayoutReady(() => setup());

      function setup() {
      if (!sectionRef.current) return;
      gsap.set(".char-panel", { clipPath: "inset(0 0 100% 0)" });
      gsap.to(".char-panel", {
        clipPath: "inset(0 0 0% 0)",
        duration: 1.1,
        stagger: 0.18,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });
      }
    },
    { scope: sectionRef }
  );

  return (
    <section id="characters" ref={sectionRef} className="relative bg-void px-6 py-28 sm:px-14">
      <Eyebrow>{t("kicker")}</Eyebrow>
      <h2
        className="font-display mt-6 text-outline"
        style={{ fontSize: "clamp(2.6rem, 9vw, 7rem)" }}
      >
        {t("heading")}
      </h2>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 sm:gap-4">
        {CHARACTERS.map((c) => {
          const name = t(`${c.id}.name`);
          const role = t(`${c.id}.role`);
          const bio = t(`${c.id}.bio`);
          return (
            <div
              key={c.id}
              className="char-panel group relative h-[78vh] overflow-hidden"
              data-cursor="view"
            >
              <Image
                src={c.image}
                alt={name}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover grayscale-[15%] transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(3,3,3,0.95) 0%, rgba(3,3,3,0.2) 40%, rgba(3,3,3,0.3) 100%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <span className={`text-[11px] uppercase tracking-[0.3em] ${c.tone}`}>
                  {role}
                </span>
                <h3
                  className="font-display mt-2 text-paper"
                  style={{ fontSize: "clamp(2.2rem, 6vw, 3.8rem)" }}
                >
                  {name}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist">{bio}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-[10px] uppercase tracking-[0.25em] text-mist-dim">
        {t("note")}
      </p>
    </section>
  );
}
