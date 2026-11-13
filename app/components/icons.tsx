type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const ArrowRight = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden><path d="M4 12h16M14 6l6 6-6 6" /></svg>
);
export const ArrowLeft = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden><path d="M20 12H4M10 6l-6 6 6 6" /></svg>
);
export const ChevronDown = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden><path d="M6 9l6 6 6-6" /></svg>
);
export const Play = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>
);
export const Pin = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /></svg>
);
export const Close = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
);

export const RouteIcon = ({ className = "h-7 w-7" }: P) => (
  <svg viewBox="0 0 32 32" className={className} {...base} aria-hidden>
    <circle cx="8" cy="6" r="2.5" /><circle cx="24" cy="26" r="2.5" />
    <path d="M10.5 6H22a4 4 0 0 1 0 8H10a4 4 0 0 0 0 8h11.5" />
  </svg>
);
export const TimerIcon = ({ className = "h-7 w-7" }: P) => (
  <svg viewBox="0 0 32 32" className={className} {...base} aria-hidden>
    <circle cx="16" cy="18" r="10" /><path d="M16 12v6l3.5 3.5M13 4h6M16 4v4" />
  </svg>
);
export const CalendarIcon = ({ className = "h-7 w-7" }: P) => (
  <svg viewBox="0 0 32 32" className={className} {...base} aria-hidden>
    <rect x="5" y="7" width="22" height="20" rx="3" /><path d="M5 13h22M11 4v6M21 4v6" />
    <path d="M10.5 18h.01M16 18h.01M21.5 18h.01M10.5 22.5h.01M16 22.5h.01M21.5 22.5h.01" strokeWidth="2.6" />
  </svg>
);
export const SparkIcon = ({ className = "h-7 w-7" }: P) => (
  <svg viewBox="0 0 32 32" className={className} {...base} aria-hidden>
    <path d="M16 4l2.8 8.2L27 15l-8.2 2.8L16 26l-2.8-8.2L5 15l8.2-2.8z" />
  </svg>
);

export const STAT_ICONS = { route: RouteIcon, timer: TimerIcon, calendar: CalendarIcon, spark: SparkIcon };

/* Mobile tab bar */
export const HomeIcon = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden><path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" /></svg>
);
export const MapIcon = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden><path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z" /><circle cx="12" cy="9.8" r="2.4" /></svg>
);
export const BookIcon = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden><path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5M12 6.5C14 5 17 4.5 20.5 5v13c-3.5-.5-6.5 0-8.5 1.5M12 6.5v13" /></svg>
);
export const ClockIcon = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);
export const RoverIcon = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden><rect x="9.5" y="3.5" width="5" height="3.2" rx="1" /><path d="M12 6.7V10" /><rect x="3.5" y="10" width="17" height="5.2" rx="1.6" /><circle cx="6.8" cy="18.2" r="1.9" /><circle cx="12" cy="18.2" r="1.9" /><circle cx="17.2" cy="18.2" r="1.9" /></svg>
);
export const GameIcon = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden><path d="M7.5 7.5h9a4.5 4.5 0 0 1 4.5 4.5v3a2.6 2.6 0 0 1-4.7 1.6L15 15H9l-1.3 1.6A2.6 2.6 0 0 1 3 15v-3a4.5 4.5 0 0 1 4.5-4.5z" /><path d="M8 10.3v3.4M6.3 12h3.4" /><circle cx="15.6" cy="11" r=".5" fill="currentColor" /><circle cx="17.4" cy="13" r=".5" fill="currentColor" /></svg>
);
export const FilmIcon = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden><rect x="3.5" y="5" width="17" height="14" rx="3.5" /><path d="M10.2 9.4v5.2l4.4-2.6z" /></svg>
);
export const HeartIcon = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" /></svg>
);
