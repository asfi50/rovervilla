import Image from "next/image";

export type CoverData = {
  title: string;
  name: string;
  art: string;
  chapters: number;
  cover: { bg: string; ink: string; accent: string };
};

/**
 * A printed-looking book cover drawn in HTML: the series imprint, the title set large, and the
 * machine standing at the foot of the cover. A darker strip and a crease on the left read as the
 * spine. Type scales with the cover's own width, so it works from shelf thumbnails to the hero.
 */
export default function BookCover({ book, sizes, priority = false, className = "" }: { book: CoverData; sizes: string; priority?: boolean; className?: string }) {
  const { bg, ink, accent } = book.cover;
  // Long titles step down a size so they never run into the machine.
  const len = book.title.length;
  const type = len > 44 ? "text-[9.6cqw]" : len > 30 ? "text-[11cqw]" : "text-[12.5cqw]";
  return (
    <div
      className={`@container relative isolate aspect-[2/3] overflow-hidden rounded-r-[6px] rounded-l-[3px] ${className}`}
      style={{ background: bg, color: ink }}
    >
      {/* soft light from the top right, and a halftone of dots rising from the ground */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_70%_at_85%_0%,rgba(255,255,255,0.28),transparent_60%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_38%_at_50%_72%,rgba(255,255,255,0.22),transparent_70%)]" />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-[55%] opacity-[0.18]"
        style={{
          backgroundImage: `radial-gradient(${accent} 22%, transparent 24%)`,
          backgroundSize: "4.2cqw 4.2cqw",
          maskImage: "linear-gradient(to top, #000 10%, transparent 95%)",
          WebkitMaskImage: "linear-gradient(to top, #000 10%, transparent 95%)",
        }}
      />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-[9cqw] pt-[8cqw] font-mono text-[4.1cqw] font-medium tracking-[0.14em] uppercase opacity-80">
        <span>Rover Villa Books</span>
        <span>{book.chapters} ch.</span>
      </div>

      <h3 className={`display absolute inset-x-0 top-[17cqw] z-10 px-[9cqw] leading-[0.95] text-balance ${type}`} style={{ letterSpacing: "-0.04em" }}>
        {book.title}
      </h3>

      <Image
        src={`/images/${book.art}.webp`}
        alt=""
        width={1340}
        height={1100}
        sizes={sizes}
        priority={priority}
        className="absolute -right-[6%] bottom-[8%] w-[98%] max-w-none drop-shadow-[0_18px_22px_rgba(0,0,0,0.35)]"
      />

      <p className="absolute inset-x-0 bottom-0 px-[9cqw] pb-[7cqw] text-[5cqw] font-semibold">
        <span className="opacity-70">told by </span>
        {book.name}
      </p>

      {/* the spine: a shaded band, a crease, and a hairline of light on the page edge */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[6%] bg-linear-to-r from-black/35 via-black/10 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-[6%] w-px bg-white/25" />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-black/10 ring-inset" />
    </div>
  );
}
