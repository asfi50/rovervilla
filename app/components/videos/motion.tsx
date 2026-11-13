"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll motion for the video pages: the billboard's picture drifts and its text lifts away as
 * you scroll past, and [data-rise] blocks below the fold slide up as they arrive. Anything
 * already on screen is left alone, so nothing blinks on load; with reduced motion nothing moves.
 */
export default function Motion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-billboard]").forEach((b) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: b, start: "top top", end: "bottom top", scrub: 0.4 } });
        tl.to(b.querySelector("[data-billboard-media]"), { yPercent: 16, scale: 1.06, ease: "none" }, 0);
        tl.to(b.querySelector("[data-billboard-content]"), { yPercent: -18, opacity: 0, ease: "none" }, 0);
      });

      const later = gsap.utils.toArray<HTMLElement>("[data-rise]").filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92);
      gsap.set(later, { y: 48, opacity: 0 });
      ScrollTrigger.batch(later, {
        start: "top 94%",
        once: true,
        onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.08, overwrite: true }),
      });
    });
    return () => ctx.revert();
  }, []);
  return null;
}
