// Deliberately has zero other imports — PosterModel.tsx (statically bundled
// with the rest of the Three.js/R3F chunk) and ModelChapter.tsx (eagerly
// bundled in the main page chunk) both need this URL string, and neither
// should have to pull in the other's dependency graph just to read it.
export const MODEL_URL = "/models/grand_theft_auto_6.glb";
