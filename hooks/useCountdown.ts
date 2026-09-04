"use client";

import { useEffect, useState } from "react";

export interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function compute(target: number): CountdownValue {
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds, done: diff <= 0 };
}

// Starts null so server and first client render match (both skip computing
// a real value from Date.now(), which would otherwise differ between the
// server's render time and the client's hydration time and trigger a
// hydration mismatch). The real countdown appears a tick after mount.
export function useCountdown(isoDate: string): CountdownValue | null {
  const target = new Date(isoDate).getTime();
  const [value, setValue] = useState<CountdownValue | null>(null);

  useEffect(() => {
    const tick = () => setValue(compute(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return value;
}
