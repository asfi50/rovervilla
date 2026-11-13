"use client";

import { useEffect, useState } from "react";

const TABS = [
  { id: "episodes", label: "Episodes" },
  { id: "residents", label: "Residents" },
  { id: "details", label: "Details" },
];

/** Sticky section tabs for a series page; the underline follows whichever section you're in. */
export default function SeriesTabs() {
  const [active, setActive] = useState("episodes");

  useEffect(() => {
    const els = TABS.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav aria-label="Series sections" className="sticky top-[calc(4rem+1px)] z-30 border-b border-white/10 bg-screen/85 backdrop-blur-xl lg:top-[77px]">
      <ul className="flex gap-7 px-5 sm:px-8 lg:px-12">
        {TABS.map((t) => (
          <li key={t.id}>
            <a
              href={`#${t.id}`}
              aria-current={active === t.id ? "true" : undefined}
              className={`relative block py-4 text-[15px] font-semibold transition-colors ${active === t.id ? "text-white" : "text-white/50 hover:text-white/80"}`}
            >
              {t.label}
              <span className={`absolute inset-x-0 bottom-0 h-[3px] origin-left rounded-full bg-brand-bright transition-transform duration-500 ease-out ${active === t.id ? "scale-x-100" : "scale-x-0"}`} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
