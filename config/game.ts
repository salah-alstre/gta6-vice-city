/**
 * Central, single-source-of-truth for verified GTA VI facts.
 * Every date/fact here was checked against Rockstar Games / Take-Two
 * announcements. If Rockstar changes any of this, update ONLY here.
 */

// Rockstar confirmed Nov 19 2026 in a Nov 2025 announcement (second delay,
// after the original 2025 target and the May 26 2026 target). Stored as
// US-Eastern midnight since Rockstar Newswire posts run on ET.
export const GAME_RELEASE_DATE = "2026-11-19T00:00:00-05:00";

export const GAME_META = {
  developer: "Rockstar North (Rockstar Games)",
  publisher: "Rockstar Games / Take-Two Interactive",
  genre: "Action-adventure, open world",
  setting: "Leonida — Vice City and the surrounding state",
  protagonists: ["Lucia Caminos", "Jason Duval"],
  confirmedPlatforms: ["PlayStation 5", "Xbox Series X|S"] as const,
  pcAnnounced: false,
} as const;

export type TrailerId = "reveal" | "trailer-2" | "extended-look";

export interface TrailerEntry {
  id: TrailerId;
  index: number;
  titleKey: string;
  date: string; // ISO date
  youtubeId: string;
  descriptionKey: string;
}

// YouTube IDs point at Rockstar Games' own official uploads.
export const TRAILERS: TrailerEntry[] = [
  {
    id: "reveal",
    index: 1,
    titleKey: "trailers.reveal.title",
    date: "2023-12-04",
    youtubeId: "QdBZY2fkU-0",
    descriptionKey: "trailers.reveal.description",
  },
  {
    id: "trailer-2",
    index: 2,
    titleKey: "trailers.trailer2.title",
    date: "2025-05-06",
    youtubeId: "VQRLujxTm3c",
    descriptionKey: "trailers.trailer2.description",
  },
  {
    id: "extended-look",
    index: 3,
    titleKey: "trailers.extendedLook.title",
    date: "2026-08-27",
    youtubeId: "tJbzMqJGH4k",
    descriptionKey: "trailers.extendedLook.description",
  },
];

export interface TimelineEvent {
  id: string;
  date: string; // ISO date
  year: number;
  titleKey: string;
  descriptionKey: string;
}

export const TIMELINE: TimelineEvent[] = [
  {
    id: "announcement",
    date: "2023-02-04",
    year: 2023,
    titleKey: "timeline.announcement.title",
    descriptionKey: "timeline.announcement.description",
  },
  {
    id: "reveal-trailer",
    date: "2023-12-04",
    year: 2023,
    titleKey: "timeline.revealTrailer.title",
    descriptionKey: "timeline.revealTrailer.description",
  },
  {
    id: "release-2025-target",
    date: "2024-02-20",
    year: 2024,
    titleKey: "timeline.release2025Target.title",
    descriptionKey: "timeline.release2025Target.description",
  },
  {
    id: "first-delay",
    date: "2025-05-02",
    year: 2025,
    titleKey: "timeline.firstDelay.title",
    descriptionKey: "timeline.firstDelay.description",
  },
  {
    id: "trailer-2",
    date: "2025-05-06",
    year: 2025,
    titleKey: "timeline.trailer2.title",
    descriptionKey: "timeline.trailer2.description",
  },
  {
    id: "second-delay",
    date: "2025-11-01",
    year: 2025,
    titleKey: "timeline.secondDelay.title",
    descriptionKey: "timeline.secondDelay.description",
  },
  {
    id: "extended-look",
    date: "2026-08-27",
    year: 2026,
    titleKey: "timeline.extendedLook.title",
    descriptionKey: "timeline.extendedLook.description",
  },
  {
    id: "launch",
    date: "2026-11-19",
    year: 2026,
    titleKey: "timeline.launch.title",
    descriptionKey: "timeline.launch.description",
  },
];
