import Image from "next/image";
import Link from "next/link";
import { type Hero, catNo, lifespan } from "@/lib/heroes";
import { Waveform } from "@/app/components/waveform";
import MachinePhoto from "@/app/components/machine-photo";

/**
 * Exhibit card: catalogue number, name, years and the last-signal waveform on the left,
 * the machine on the right. Heroes with a studio cut-out (`hero.card`, a transparent WebP)
 * show it standing in the card; the rest fall back to a framed photo.
 */
export default function HeroCard({ hero, size = "md", priority = false }: { hero: Hero; size?: "lg" | "md"; priority?: boolean }) {
  const lg = size === "lg";
  const sizes = lg ? "(min-width:1024px) 30vw, 90vw" : "(min-width:1024px) 20vw, 60vw";

  const picture = hero.card ? (
    <div className={`pointer-events-none absolute -z-10 ${lg ? "right-0 bottom-0 h-[58%] w-full p-4 lg:h-[66%] lg:w-[76%]" : "inset-x-0 bottom-0 h-[48%] px-3 pb-3 sm:inset-y-0 sm:left-auto sm:h-auto sm:w-[56%] sm:py-4 sm:pr-3 sm:pl-0"}`}>
      <div className="relative h-full w-full">
        <Image
          src={`/images/${hero.card}.webp`}
          alt=""
          fill
          priority={priority}
          sizes={sizes}
          className="object-contain object-bottom drop-shadow-[0_18px_18px_rgba(45,20,90,0.08)] transition-transform duration-700 group-hover:-translate-y-1 group-hover:scale-[1.03]"
        />
      </div>
    </div>
  ) : lg ? (
    <MachinePhoto
      name={hero.image}
      ratio={0.85}
      fill={0.92}
      anchor={{ x: 52, y: 52 }}
      priority={priority}
      sizes={sizes}
      className="right-0 bottom-0 -z-10 h-[55%] w-full lg:h-[78%] lg:w-[64%]"
    />
  ) : (
    <MachinePhoto
      name={hero.image}
      ratio={1.05}
      fill={0.84}
      anchor={{ x: 52, y: 54 }}
      priority={priority}
      sizes={sizes}
      className="inset-x-0 bottom-0 -z-10 h-[50%] sm:inset-y-0 sm:left-auto sm:h-auto sm:w-[62%]"
    />
  );

  return (
    <Link
      href={`/heroes/${hero.slug}`}
      className={`group relative isolate flex overflow-hidden rounded-2xl border border-line bg-[linear-gradient(135deg,#ffffff_0%,#f1f0f9_100%)] transition-shadow hover:shadow-[0_18px_40px_-18px_rgba(45,20,140,0.35)] ${
        lg ? "h-full min-h-[480px]" : "min-h-[330px] sm:min-h-[230px]"
      }`}
    >
      {picture}
      <div className={`flex flex-col ${lg ? "p-6 lg:p-8" : "w-full p-4 sm:max-w-[48%] sm:p-5"}`}>
        <p className="font-mono text-xs">{catNo(hero.no)}</p>
        <h3 className={`display mt-2 ${lg ? "text-4xl lg:text-5xl" : "text-[22px] leading-[1.05] sm:text-[26px]"}`}>{hero.name}</h3>
        <p className="mt-2 font-mono text-sm">{lifespan(hero)}</p>
        <Waveform seed={hero.slug} bars={lg ? 30 : 24} className={`text-brand ${lg ? "mt-6 h-10 w-44" : "mt-3 h-6 w-24 sm:mt-4 sm:h-7 sm:w-28"}`} />
        <p className={`font-mono text-[13px] leading-relaxed ${lg ? "mt-6" : "mt-3 text-[12px] sm:mt-auto sm:pt-4 sm:text-[13px]"}`}>
          {hero.end.label}
          <br />
          {hero.end.date}
        </p>
      </div>
    </Link>
  );
}
