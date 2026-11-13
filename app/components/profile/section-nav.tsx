"use client";

import { useEffect, useState } from "react";

/** Sidebar list of the profile's sections; the dot fills for whichever one is on screen. */
export default function SectionNav({ items, variant = "list" }: { items: { id: string; label: string }[]; variant?: "list" | "chips" }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);

  if (variant === "chips") {
    return (
      <nav aria-label="On this page" className="no-scrollbar edge-fade -mx-4 overflow-x-auto px-4">
        <ul className="flex w-max gap-2 py-2">
          {items.map((i) => (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                aria-current={active === i.id ? "true" : undefined}
                className={`block rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  active === i.id ? "bg-brand text-white" : "border border-line bg-white text-ink"
                }`}
              >
                {i.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="On this page">
      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              aria-current={active === i.id ? "true" : undefined}
              className="group flex items-center gap-4 py-1.5 text-[15px] transition-colors hover:text-brand"
            >
              <span
                className={`h-[18px] w-[18px] rounded-full border-2 transition-colors ${
                  active === i.id ? "border-brand bg-brand" : "border-line bg-white group-hover:border-brand"
                }`}
                aria-hidden
              />
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
