"use client";

import { useEffect, useRef, useState } from "react";

const POSTER = "/video/opportunity-poster.webp";

/**
 * Muted, looping background video for the home hero. Picks the 540p or 720p encode by
 * screen width, and stays on the poster frame for reduced motion or data-saver visitors.
 */
export default function HeroVideo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [size, setSize] = useState<"540" | "720" | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduced || saveData) return;
    // Defer source choice to the client so the server HTML only carries the poster.
    const id = requestAnimationFrame(() => setSize(window.innerWidth * Math.min(window.devicePixelRatio, 2) > 1600 ? "720" : "540"));
    return () => cancelAnimationFrame(id);
  }, []);

  // Pause while scrolled away; resume when back.
  useEffect(() => {
    const v = ref.current;
    if (!v || !size) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(v);
    return () => io.disconnect();
  }, [size]);

  return (
    <video
      ref={ref}
      key={size ?? "poster"}
      className={className}
      poster={POSTER}
      autoPlay
      muted
      loop
      playsInline
      preload={size ? "auto" : "none"}
      aria-hidden
      tabIndex={-1}
      disablePictureInPicture
    >
      {size && (
        <>
          <source src={`/video/opportunity-${size}.webm`} type="video/webm" />
          <source src={`/video/opportunity-${size}.mp4`} type="video/mp4" />
        </>
      )}
    </video>
  );
}
