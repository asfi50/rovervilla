"use client";

import { useEffect } from "react";

/**
 * Fades up every [data-reveal] element as it scrolls into view.
 * Content is visible by default: elements are only hidden once this has mounted and is
 * observing them (via the `reveal-ready` class), so a failed script never hides anything.
 */
export function RevealManager() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          // Stagger siblings that enter together.
          el.style.transitionDelay = `${(els.indexOf(el) % 4) * 70}ms`;
          el.dataset.revealed = "";
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    document.documentElement.classList.add("reveal-ready");
    return () => {
      io.disconnect();
      document.documentElement.classList.remove("reveal-ready");
    };
  }, []);
  return null;
}
