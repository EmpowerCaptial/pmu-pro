"use client";
import * as React from "react";
import { fmt } from "@/lib/timeclock";

export function UxTimeTicker({ startIso, pauseIso }: { startIso: string; pauseIso?: string }) {
  // Hydration-safe ticker: only starts after mount
  const [now, setNow] = React.useState<number>(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const endMs = pauseIso ? new Date(pauseIso).getTime() : now;
  const seconds = Math.max(0, Math.floor((endMs - new Date(startIso).getTime()) / 1000));
  return <span className="font-mono tabular-nums">{fmt(seconds)}</span>;
}
