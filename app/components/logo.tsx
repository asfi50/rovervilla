import { EYE, WORDMARK } from "@/app/components/logo-paths";

/** The rover eye from the logo: the "O" with its two antennae. Takes the current text colour. */
export function RoverMark({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${EYE.width} ${EYE.height}`} fill="currentColor" className={className} aria-hidden>
      <path transform={EYE.transform} d={EYE.d} />
    </svg>
  );
}

/** The stacked Rover Villa wordmark. Takes the current text colour. */
export function Logo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <svg
        viewBox={`0 0 ${WORDMARK.width} ${WORDMARK.height}`}
        fill="currentColor"
        role="img"
        aria-label="Rover Villa"
        className={compact ? "h-9 w-auto" : "h-11 w-auto lg:h-[52px]"}
      >
        <path transform={WORDMARK.transform} d={WORDMARK.d} />
      </svg>
    </span>
  );
}
