"use client";

import { useEffect, useRef, useState, useId } from "react";

export type BookingWidgetProps = {
  handle: string;               // user slug (e.g. "tierra")
  height?: number;              // fallback height; auto-resizes if messages received
  theme?: "dark" | "light";     // forwarded to embed
  className?: string;
};

export default function BookingWidget({ handle, height = 680, theme = "dark", className }: BookingWidgetProps) {
  const [src, setSrc] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const id = useId(); // stable id for accessibility and messaging

  // Construct src after mount to prevent SSR/CSR divergence
  useEffect(() => {
    try {
      const origin = window.location.origin;
      const url = new URL(`/book/${encodeURIComponent(handle)}/embed`, origin);
      url.searchParams.set("theme", theme);
      url.searchParams.set("parent", origin);
      url.searchParams.set("wid", id); // pass widget id to the embed for postMessage routing
      setSrc(url.toString());
    } catch {
      // no-op on server
    }
  }, [handle, theme, id]);

  // Auto-height via postMessage from the embed page
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!iframeRef.current) return;
      if (typeof event.data !== "object" || event.data == null) return;
      const { type, height: h, id: targetId } = event.data as any;
      if (type === "pmuguide:embed:height" && targetId === id && typeof h === "number") {
        iframeRef.current.style.height = `${Math.max(h, 480)}px`;
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [id]);

  return (
    <div className={className}>
      {src ? (
        <iframe
          ref={iframeRef}
          id={id}
          title={`Booking for ${handle}`}
          src={src}
          style={{ width: "100%", border: 0, height }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        // Stable skeleton to avoid hydration diff
        <div style={{ height, width: "100%" }} className="rounded-xl bg-black/5" aria-busy>
          {/* skeleton */}
        </div>
      )}
    </div>
  );
}
