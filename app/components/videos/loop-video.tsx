"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A silent background loop that picks the tall cut on phones and the wide one elsewhere,
 * loads only that one, fades in once it is actually playing and pauses while off screen.
 * The still behind it is the picture until then, and the only picture with reduced motion.
 */
export default function LoopVideo({
  wide,
  tall,
  wideStill,
  tallStill,
  className = "",
}: {
  wide: string;
  tall: string;
  wideStill: string;
  tallStill: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const v = ref.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const phone = window.matchMedia("(max-width: 639.98px)");
    const pick = () => {
      const src = phone.matches ? tall : wide;
      if (v.getAttribute("src") === src) return;
      setOn(false);
      v.src = src;
      v.play().catch(() => {});
    };
    // Nothing downloads until the loop is near the screen.
    let started = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return v.pause();
        if (!started) {
          started = true;
          pick();
          phone.addEventListener("change", pick);
        } else v.play().catch(() => {});
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(v);
    return () => {
      phone.removeEventListener("change", pick);
      io.disconnect();
    };
  }, [wide, tall]);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <picture>
        <source media="(max-width: 639.98px)" srcSet={tallStill} />
        <img src={wideStill} alt="" className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
      </picture>
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="auto"
        onPlaying={() => setOn(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${on ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
