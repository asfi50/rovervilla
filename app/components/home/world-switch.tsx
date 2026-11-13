"use client";

import { useState, type ReactNode } from "react";

/**
 * Phones show one family at a time behind a Mars / Moon switch, so the two orbits don't
 * stack into a very long scroll. From tablets up both are shown, as before.
 */
export default function WorldSwitch({ mars, moon }: { mars: ReactNode; moon: ReactNode }) {
  const [at, setAt] = useState<"mars" | "moon">("mars");
  return (
    <>
      <div role="tablist" aria-label="Choose a world" className="mx-auto mb-1 flex w-fit rounded-full bg-mist p-1 ring-1 ring-line md:hidden">
        {(["mars", "moon"] as const).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={at === k}
            onClick={() => setAt(k)}
            className={`rounded-full px-6 py-2 text-[14px] font-semibold transition ${at === k ? "bg-white text-ink shadow-sm ring-1 ring-line" : "text-ink-soft"}`}
          >
            <span className={`mr-2 inline-block h-2 w-2 rounded-full align-middle ${k === "mars" ? "bg-mars" : "bg-brand"}`} />
            {k === "mars" ? "Mars" : "Moon"}
          </button>
        ))}
      </div>
      <div className={at === "mars" ? "" : "max-md:hidden"}>{mars}</div>
      <div className={at === "moon" ? "" : "max-md:hidden"}>{moon}</div>
    </>
  );
}
