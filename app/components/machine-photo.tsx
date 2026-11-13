import Image from "next/image";
import { FRAMES } from "@/lib/frames";
import { img } from "@/lib/heroes";

/**
 * Frames a machine inside its area: scales the photo so the machine's bounding box fills
 * `fill` of the area, puts the machine's centre on `anchor`, and fades the surrounding
 * ground out with a soft radial edge so it melts into the card behind it.
 *
 * `ratio` is the area's width / height, used to keep wide machines from overflowing.
 */
export default function MachinePhoto({
  name,
  ratio,
  fill = 0.82,
  anchor = { x: 50, y: 54 },
  sizes,
  priority = false,
  className = "",
}: {
  name: string;
  ratio: number;
  fill?: number;
  anchor?: { x: number; y: number };
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const frame = FRAMES[name];
  if (!frame) {
    return (
      <div className={`absolute overflow-hidden ${className}`}>
        <Image src={img(name)} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }

  const [x0, y0, x1, y1] = frame.box;
  const mw = (x1 - x0) / 100;
  const mh = (y1 - y0) / 100;
  const fx = (x0 + x1) / 2;
  const fy = (y0 + y1) / 2;
  const aspect = frame.w / frame.h;
  // Photo height as a multiple of the area's height.
  const zoom = Math.min(fill / mh, (fill * ratio) / (aspect * mw));
  // The machine's edge lands at 62% of the fade's radius: crisp machine, soft ground.
  // Intersected with fades along the photo's own edges, so no straight cut ever shows.
  const radial = `radial-gradient(ellipse ${(mw * 100) / 1.24}% ${(mh * 100) / 1.24}% at ${fx}% ${fy}%, #000 62%, transparent 100%)`;
  const edges = (dir: string) => `linear-gradient(${dir}, transparent 0%, transparent 1.5%, #000 9%, #000 91%, transparent 98.5%, transparent 100%)`;
  const mask = `${radial}, ${edges("to right")}, ${edges("to bottom")}`;

  return (
    <div className={`pointer-events-none absolute ${className}`} style={{ containerType: "size" }} aria-hidden>
      <Image
        src={img(name)}
        alt=""
        width={frame.w}
        height={frame.h}
        sizes={sizes}
        priority={priority}
        style={{
          // Sized and placed in container units (no transform, which leaves a hairline
          // seam at the photo's edge on some GPUs).
          position: "absolute",
          height: `${zoom * 100}cqh`,
          width: `${zoom * aspect * 100}cqh`,
          maxWidth: "none",
          left: `calc(${anchor.x}cqw - ${(zoom * aspect * fx).toFixed(3)}cqh)`,
          top: `calc(${anchor.y}cqh - ${(zoom * fy).toFixed(3)}cqh)`,
          maskImage: mask,
          WebkitMaskImage: mask,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
    </div>
  );
}
