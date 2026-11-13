"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Desktop: a little rocket in the corner once you are far down a page. Press it and it blasts
 * off while the page scrolls back to the top.
 */
export default function RocketTop() {
  const pathname = usePathname();
  const [shown, setShown] = useState(false);
  const [launch, setLaunch] = useState(false);

  useEffect(() => {
    const on = () => setShown(window.scrollY > 1400);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  if (pathname.startsWith("/games/") || /^\/heroes\/[^/]+\/story$/.test(pathname)) return null;
  const dark = pathname.startsWith("/videos") || pathname.startsWith("/series");

  const go = () => {
    setLaunch(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => setLaunch(false), 1100);
  };

  // .glass sets its own position, so the fixed placement lives on a wrapper.
  return (
    <div
      className={`fixed right-6 bottom-6 z-40 hidden transition-[opacity,translate] duration-500 lg:block ${shown || launch ? "opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
    >
      <button
        onClick={go}
        aria-label="Back to the top"
        tabIndex={shown ? 0 : -1}
        className={`group glass grid h-14 w-14 place-items-center rounded-full ${dark ? "glass-dark text-white" : "text-brand"}`}
      >
        <svg
          viewBox="0 0 32 40"
          className={`h-8 w-7 overflow-visible ${launch ? "rocket-launch" : "transition-transform duration-300 group-hover:-translate-y-1"}`}
          aria-hidden
        >
          {/* flame */}
          <path
            d="M12.5 29c0 4 1.6 7 3.5 9 1.9-2 3.5-5 3.5-9z"
            fill="#ff8a3c"
            className={`origin-top ${launch ? "" : "scale-y-0 transition-transform duration-200 group-hover:scale-y-100"}`}
          />
          <path d="M16 3c5 4 7 10 7 17v8H9v-8c0-7 2-13 7-17z" fill="currentColor" />
          <circle cx="16" cy="15" r="3" fill="#fff" />
          <path d="M9 21l-5 6v3h5zM23 21l5 6v3h-5z" fill="#ff5a1f" />
        </svg>
      </button>
    </div>
  );
}
