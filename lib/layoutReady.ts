import { ScrollTrigger } from "@/lib/gsap";

/**
 * Coordinates when it's safe to create a pinned ScrollTrigger.
 *
 * Root cause this works around: a ScrollTrigger created with `pin: true`
 * and `start: "top top"` caches its start/end at creation time. If it's
 * created before an earlier async layout change lands — concretely, the
 * scroll-video chapter's pin-spacer, which is only inserted once the
 * video's `loadedmetadata` fires — every trigger below it ends up with a
 * start/end measured against a too-short document. `ScrollTrigger.refresh()`
 * is documented to recalculate this, but empirically (verified by logging
 * `onRefresh` here) it does not correct an already-pinned trigger's cached
 * "top top" once it has been created against the wrong layout — it keeps
 * re-reporting the original numbers. Waiting to create the trigger in the
 * first place, rather than creating it early and hoping a refresh fixes it
 * later, is what actually works.
 *
 * `window.load` fires after the video element (preload="auto") has
 * resolved far enough for the browser to know its layout impact, plus two
 * rAFs so the resulting pin-spacer has actually been committed and painted
 * before anything downstream measures the page. Those two rAFs are raced
 * against a fixed timeout (see `waitTwoFrames`) rather than awaited
 * unconditionally: rAF callbacks are throttled or skipped entirely by the
 * browser under some conditions (a backgrounded/unfocused tab, a very
 * loaded main thread), and every pinned section on the page depends on this
 * promise resolving to ever create its ScrollTrigger — an indefinitely
 * stalled rAF must not mean an indefinitely stalled pin.
 *

 * Every section that pins or scrubs registers here, and every registered
 * callback fires back-to-back in the same microtask flush once the shared
 * promise resolves — which means, mid-flush, a later section's
 * `ScrollTrigger.create({pin:true, ...})` call is inserting a pin-spacer
 * (changing document height) while an *earlier* section's trigger is still
 * settling. Empirically (see World.tsx's now-removed onRefresh logging, kept
 * here in spirit) this produced a trigger whose "start" was cached short by
 * exactly its own pin distance — a genuinely wrong measurement, not a
 * transient one, since it reread the same wrong numbers on every subsequent
 * refresh. A single debounced `ScrollTrigger.refresh()` fired once the whole
 * batch of onLayoutReady callbacks has finished running — after every pin in
 * the batch already exists — gives GSAP one clean, final pass to recompute
 * every trigger's start/end against the fully-settled document.
 */
let readyPromise: Promise<void> | null = null;
let finalRefreshTimer: ReturnType<typeof setTimeout> | null = null;

// Frame timeout bound: 32-33ms is roughly two frames at 60fps — comfortably
// enough for the two-rAF case to win the race under normal conditions,
// short enough that a real stall (see file comment) isn't a long visible
// delay before pins engage.
const FRAME_FALLBACK_MS = 250;

function waitTwoFrames(): Promise<void> {
  const rafPromise = new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  const timeoutPromise = new Promise<void>((resolve) => {
    setTimeout(resolve, FRAME_FALLBACK_MS);
  });
  return Promise.race([rafPromise, timeoutPromise]);
}

function scheduleFinalRefresh() {
  if (finalRefreshTimer !== null) clearTimeout(finalRefreshTimer);
  finalRefreshTimer = setTimeout(() => {
    finalRefreshTimer = null;
    ScrollTrigger.refresh();
  }, 120);
}

export function onLayoutReady(callback: () => void): () => void {
  let cancelled = false;

  if (!readyPromise) {
    readyPromise = new Promise((resolve) => {
      const settle = () => waitTwoFrames().then(resolve);
      if (document.readyState === "complete") {
        settle();
      } else {
        window.addEventListener("load", settle, { once: true });
      }
    });
  }

  readyPromise.then(() => {
    if (!cancelled) callback();
    scheduleFinalRefresh();
  });

  return () => {
    cancelled = true;
  };
}
