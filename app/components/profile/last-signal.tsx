import type { LostHow } from "@/lib/heroes";

/**
 * How the signal ended, drawn instead of a generic waveform. Each machine was lost differently:
 * an impact, a dust storm, winter, a dead battery, a bad command, a landing that never reported.
 * Pure SVG with CSS animation (see .ls-* in globals.css); still under prefers-reduced-motion.
 */
export default function LastSignalArt({ how, className = "" }: { how: LostHow; className?: string }) {
  return (
    <svg viewBox="0 0 320 120" className={`ls ls-${how} ${className}`} role="img" aria-label={CAPTION[how]} fill="none" stroke="currentColor" strokeLinecap="round">
      {ART[how]}
    </svg>
  );
}

export const CAPTION: Record<LostHow, string> = {
  impact: "Flown into the surface",
  dust: "Dust blotted out the Sun",
  winter: "Winter took the light",
  power: "The batteries gave out",
  command: "A command from Earth cut the link",
  lost: "Never reported after landing",
  left: "Left behind where it stopped",
  night: "Fell silent after the lunar nights",
  grounded: "A damaged rotor blade grounded it",
};

const ground = <path d="M0 104 Q80 98 160 103 T320 101" strokeWidth="1.5" opacity="0.5" />;

const ART: Record<LostHow, React.ReactNode> = {
  impact: (
    <>
      {ground}
      <path className="ls-fall" d="M40 8 L196 100" strokeWidth="2" strokeDasharray="4 6" />
      <circle className="ls-flash" cx="200" cy="102" r="10" strokeWidth="2" />
      <circle className="ls-flash ls-d2" cx="200" cy="102" r="10" strokeWidth="1.2" />
    </>
  ),
  dust: (
    <>
      {ground}
      <circle className="ls-sun-dim" cx="250" cy="34" r="16" fill="currentColor" stroke="none" />
      {Array.from({ length: 26 }, (_, i) => (
        <circle key={i} className="ls-dust" cx={(i * 47) % 320} cy={20 + ((i * 29) % 80)} r={1 + (i % 3) * 0.6} fill="currentColor" stroke="none" style={{ animationDelay: `${-(i % 9) * 0.7}s` }} />
      ))}
      <path d="M70 96 h56 M98 96 v-14 M80 82 h36" strokeWidth="2" />
    </>
  ),
  winter: (
    <>
      {ground}
      <path className="ls-sun-set" d="M210 104 a26 26 0 0 1 52 0" fill="currentColor" stroke="none" />
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i} className="ls-frost" style={{ animationDelay: `${i * 0.5}s` }} transform={`translate(${30 + i * 26} ${70 + (i % 2) * 14})`}>
          <path d="M0 -6 V6 M-5 -3 L5 3 M-5 3 L5 -3" strokeWidth="1.2" />
        </g>
      ))}
    </>
  ),
  power: (
    <>
      <rect x="100" y="34" width="110" height="50" rx="6" strokeWidth="2" />
      <rect x="210" y="50" width="8" height="18" rx="2" strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} className="ls-cell" x={108 + i * 25} y="42" width="20" height="34" rx="3" fill="currentColor" stroke="none" style={{ animationDelay: `${(3 - i) * 0.6}s` }} />
      ))}
    </>
  ),
  command: (
    <>
      <path d="M40 96 L60 60 L80 96 M44 88 h32" strokeWidth="2" />
      <circle cx="60" cy="56" r="4" fill="currentColor" stroke="none" />
      {[0, 1, 2].map((i) => (
        <path key={i} className="ls-ring" d="M80 40 a40 40 0 0 1 0 40" transform={`translate(${i * 26} 0)`} strokeWidth="2" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
      <path className="ls-cut" d="M200 44 L232 76 M232 44 L200 76" strokeWidth="2.5" />
      <circle cx="270" cy="60" r="22" strokeWidth="1.5" opacity="0.6" />
    </>
  ),
  lost: (
    <>
      {ground}
      <path d="M30 10 C120 20 180 50 210 84" strokeWidth="2" strokeDasharray="3 7" className="ls-fall" />
      <text x="220" y="96" fill="currentColor" stroke="none" fontSize="28" fontFamily="var(--font-display)" className="ls-q">?</text>
    </>
  ),
  left: (
    <>
      {ground}
      <path d="M140 102 L150 84 h28 l10 18 M150 84 l4 -14 h20 l4 14" strokeWidth="2" />
      <circle className="ls-sun-set" cx="250" cy="100" r="20" fill="currentColor" stroke="none" opacity="0.5" />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} className="ls-star" cx={(i * 61) % 300 + 10} cy={10 + ((i * 23) % 50)} r="1.2" fill="currentColor" stroke="none" style={{ animationDelay: `${(i % 5) * 0.6}s` }} />
      ))}
    </>
  ),
  night: (
    <>
      {ground}
      <path d="M150 102 L160 80 h20 l10 22 M170 80 v-16 M160 64 h20" strokeWidth="2" />
      {[0, 1, 2].map((i) => (
        <path key={i} className="ls-ring ls-fading" d={`M${190 + i * 16} ${56 - i * 8} a${14 + i * 10} ${14 + i * 10} 0 0 1 0 ${24 + i * 16}`} strokeWidth="2" style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
      <circle cx="60" cy="34" r="14" strokeWidth="1.5" opacity="0.5" />
      <path d="M60 20 a14 14 0 0 0 0 28 a10 14 0 0 1 0 -28" fill="currentColor" stroke="none" opacity="0.5" />
    </>
  ),
  grounded: (
    <>
      {ground}
      <path d="M160 100 l-12 -24 M160 100 l12 -24 M160 76 v-14" strokeWidth="2" />
      <rect x="148" y="76" width="24" height="10" rx="2" strokeWidth="2" />
      <g className="ls-rotor">
        <path d="M100 58 H160" strokeWidth="3" />
        <path d="M160 58 H206" strokeWidth="3" />
        <path className="ls-chip" d="M210 58 h10" strokeWidth="3" />
      </g>
    </>
  ),
};
