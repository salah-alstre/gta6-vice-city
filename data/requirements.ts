export interface RequirementTier {
  key: "minimum" | "recommended" | "high" | "fourK";
  os: string;
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
}

// UNOFFICIAL ESTIMATES ONLY — Rockstar has not announced a PC version or
// any PC specs. These are rough, clearly-labeled community-style guesses
// based on comparable current-generation open-world titles, kept in one
// place so they're easy to correct or remove later.
export const REQUIREMENT_ESTIMATES: RequirementTier[] = [
  {
    key: "minimum",
    os: "Windows 10/11 64-bit",
    cpu: "Ryzen 5 3600 / Core i5-9600K",
    gpu: "GTX 1660 Super / RX 590",
    ram: "16 GB",
    storage: "150+ GB SSD",
  },
  {
    key: "recommended",
    os: "Windows 10/11 64-bit",
    cpu: "Ryzen 5 5600X / Core i7-10700K",
    gpu: "RTX 3060 Ti / RX 6700 XT",
    ram: "16 GB",
    storage: "150+ GB SSD",
  },
  {
    key: "high",
    os: "Windows 10/11 64-bit",
    cpu: "Ryzen 7 5800X3D / Core i7-12700K",
    gpu: "RTX 4070 / RX 7800 XT",
    ram: "32 GB",
    storage: "150+ GB NVMe SSD",
  },
  {
    key: "fourK",
    os: "Windows 10/11 64-bit",
    cpu: "Ryzen 9 7900X / Core i9-13900K",
    gpu: "RTX 4080 / RX 7900 XTX",
    ram: "32 GB",
    storage: "150+ GB NVMe SSD",
  },
];
