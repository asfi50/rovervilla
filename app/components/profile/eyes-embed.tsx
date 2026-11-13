"use client";

import { useState } from "react";

/**
 * NASA's Eyes on the Solar System, embedded on demand: it is a full 3D app, so it only loads
 * when someone asks for it.
 */
export default function EyesEmbed({ src, name }: { src: string; name: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_50%_40%,#1d1840_0%,#05040f_75%)]">
      {on ? (
        <iframe src={src} title={`${name} in NASA's Eyes on the Solar System`} allow="fullscreen" className="absolute inset-0 h-full w-full" />
      ) : (
        <button onClick={() => setOn(true)} className="group absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-white">
          <span className="relative flex h-20 w-20 items-center justify-center">
            <span className="pulse-ring absolute inset-0 rounded-full border-2 border-brand-bright" />
            <span className="h-3 w-3 rounded-full bg-brand-bright" />
          </span>
          <span className="display text-2xl">Fly along with {name}</span>
          <span className="max-w-md text-sm text-white/75">Opens NASA&apos;s Eyes on the Solar System, a 3D app built on real spacecraft data. It is large, so it loads only when you ask.</span>
          <span className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold transition-colors group-hover:bg-brand-deep">Load the 3D view</span>
        </button>
      )}
    </div>
  );
}
