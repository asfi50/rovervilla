/**
 * A little rover that trundles along the top of the footer, wheels turning, forever.
 * Pure CSS; it parks at the left with reduced motion.
 */
export default function RoverDrive({ dark = false }: { dark?: boolean }) {
  return (
    <div aria-hidden className="relative h-11 overflow-hidden">
      <div className={`absolute inset-x-0 bottom-[5px] border-b-2 border-dashed ${dark ? "border-white/12" : "border-ink/10"}`} />
      <div className="rover-drive absolute bottom-[4px]">
        <svg viewBox="0 0 64 42" className="rover-body block h-[38px] w-[58px]">
          {/* mast and camera head, with two round eyes */}
          <path d="M44 15V6" stroke={dark ? "#c9d3ff" : "#0d0b26"} strokeWidth="2.2" strokeLinecap="round" />
          <rect x="38.5" y="1" width="12" height="6.5" rx="2.4" fill={dark ? "#c9d3ff" : "#0d0b26"} />
          <circle cx="42.3" cy="4.2" r="1.6" fill="#fff" />
          <circle cx="47" cy="4.2" r="1.6" fill="#fff" />
          {/* antenna dish */}
          <path d="M19 15c0-4 3-6 6-6" stroke={dark ? "#c9d3ff" : "#0d0b26"} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* solar deck and body */}
          <rect x="9" y="14" width="44" height="3.5" rx="1.2" fill={dark ? "#4a68ff" : "#0a26d6"} />
          <rect x="15" y="17" width="32" height="9" rx="2.5" fill={dark ? "#8c9eff" : "#1238ff"} />
          {/* rocker-bogie legs */}
          <path d="M14 35l8-9h18l8 9M22 26l8 9" stroke={dark ? "#c9d3ff" : "#0d0b26"} strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
          {[14, 30, 48].map((x) => (
            <g key={x} className="rover-wheel">
              <circle cx={x} cy="35" r="5.5" fill={dark ? "#1b1f45" : "#0d0b26"} />
              <path d={`M${x - 3.5} 35h7M${x} 31.5v7`} stroke={dark ? "#8c9eff" : "#9aa6ff"} strokeWidth="1.4" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
