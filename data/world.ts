export interface WorldLocation {
  id: string;
  titleKey: string;
  bodyKey: string;
  image: string;
  secondaryImage: string;
  /** Ambient accent this location tints the scene with, on-brand per the Vice City palette. */
  accent: string;
}

export const WORLD_LOCATIONS: WorldLocation[] = [
  {
    id: "vice-city",
    titleKey: "loc1Title",
    bodyKey: "loc1Body",
    image: "/images/world/vice-city.jpg",
    secondaryImage: "/images/gallery/vice-city-02.jpg",
    accent: "#ff3d81",
  },
  {
    id: "leonida-keys",
    titleKey: "loc2Title",
    bodyKey: "loc2Body",
    image: "/images/world/leonida-keys.jpg",
    secondaryImage: "/images/gallery/leonida-keys-02.jpg",
    accent: "#2dd4cf",
  },
  {
    id: "port-gellhorn",
    titleKey: "loc3Title",
    bodyKey: "loc3Body",
    image: "/images/world/port-gellhorn.jpg",
    secondaryImage: "/images/gallery/port-gellhorn-02.jpg",
    accent: "#ff7a30",
  },
  {
    id: "ambrosia",
    titleKey: "loc4Title",
    bodyKey: "loc4Body",
    image: "/images/world/ambrosia.jpg",
    secondaryImage: "/images/gallery/ambrosia-02.jpg",
    accent: "#e8b04f",
  },
  {
    id: "grassrivers",
    titleKey: "loc5Title",
    bodyKey: "loc5Body",
    image: "/images/world/grassrivers.jpg",
    secondaryImage: "/images/gallery/grassrivers-02.jpg",
    accent: "#5fae6f",
  },
  {
    id: "mount-kalaga",
    titleKey: "loc6Title",
    bodyKey: "loc6Body",
    image: "/images/world/mount-kalaga.jpg",
    secondaryImage: "/images/gallery/mount-kalaga-02.jpg",
    accent: "#9b4dff",
  },
];
