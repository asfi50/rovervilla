import { WORDMARK } from "@/app/components/logo-paths";
import type { Series } from "@/lib/videos";

/** A series' title lockup: the Rover Villa wordmark with the series badge stuck on like a sticker. */
export default function TitleArt({ series, className = "w-[220px]" }: { series: Series; className?: string }) {
  return (
    <span className={`@container relative inline-block ${className}`}>
      <svg viewBox={`0 0 ${WORDMARK.width} ${WORDMARK.height}`} fill="currentColor" role="img" aria-label={series.badge ? `${series.title} ${series.badge}` : series.title} className="block h-auto w-full drop-shadow-[0_6px_24px_rgba(0,0,0,0.35)]">
        <path transform={WORDMARK.transform} d={WORDMARK.d} />
      </svg>
      {series.badge && (
        <span
          aria-hidden
          className="display absolute -right-[9%] -bottom-[5%] -rotate-[8deg] rounded-[0.28em] bg-brand px-[0.3em] pt-[0.1em] pb-[0.16em] text-[13cqw] leading-none text-white shadow-[0_0.2em_0.6em_-0.15em_rgba(18,56,255,0.9)] outline-[0.07em] outline-white outline-solid"
        >
          {series.badge}
        </span>
      )}
    </span>
  );
}
