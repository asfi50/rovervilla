/** Deterministic pseudo-random heights so server and client render the same bars. */
function heights(seed: string, count: number) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return Array.from({ length: count }, (_, i) => {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    const envelope = Math.sin(((i + 1) / (count + 1)) * Math.PI) ** 0.6;
    return 0.18 + (h % 1000) / 1000 * 0.82 * envelope;
  });
}

/**
 * The recurring signal motif: a burst of bars that fades into a flat line.
 * `fade` controls how much of the width is the dying tail (0 = bars only).
 */
export function Waveform({
  seed = "signal",
  bars = 28,
  fade = 0.35,
  live = false,
  className = "h-8 w-40 text-brand",
}: {
  seed?: string;
  bars?: number;
  fade?: number;
  live?: boolean;
  className?: string;
}) {
  const hs = heights(seed, bars);
  const step = 4;
  const barsW = bars * step;
  const width = barsW / (1 - fade);
  return (
    <svg viewBox={`0 0 ${width} 40`} preserveAspectRatio="none" className={`${className} ${live ? "wave-live" : ""}`} aria-hidden>
      <line x1="0" x2={width} y1="20" y2="20" stroke="currentColor" strokeWidth="1.2" opacity={fade ? 0.55 : 0} />
      {hs.map((v, i) => (
        <rect
          key={i}
          x={i * step + 0.6}
          y={20 - v * 19}
          width="1.8"
          height={v * 38}
          rx="0.9"
          fill="currentColor"
          style={live ? { animationDelay: `${(i % 7) * -0.23}s` } : undefined}
        />
      ))}
    </svg>
  );
}
