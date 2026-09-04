/**
 * Explicit locale + UTC timezone so the formatted string is identical on
 * the server and the client — `toLocaleDateString(undefined, ...)` resolves
 * against each environment's own default locale/timezone, which can differ
 * and trigger a hydration mismatch.
 */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
