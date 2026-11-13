import Image from "next/image";
import Link from "next/link";
import { HEROES, catNo, img, lifespan, portrait, storyChapters } from "@/lib/heroes";
import { photo } from "@/lib/photos";
import { generateSEO } from "@/lib/seo";
import SitePage from "@/app/components/site-page";
import { ArrowRight } from "@/app/components/icons";

export const metadata = generateSEO({
  title: "Stories: every machine, chapter by chapter | Rover Villa",
  description: "Pick a machine and scroll through its life, from the cleanroom to its last signal.",
  path: "/story",
});

/** Story index: one card per hero, each opening that hero's chaptered story. */
export default function StoryIndex() {
  return (
    <SitePage eyebrow="Story" title="Their lives, chapter by chapter." lede="Pick a machine. Its story opens one screen at a time, from the cleanroom to the last signal.">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HEROES.map((h) => {
          const pic = photo(portrait(h), h.name);
          return (
            <li key={h.slug} data-reveal>
              <Link href={`/heroes/${h.slug}/story`} className="group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-night p-5 text-white sm:aspect-[3/4]">
                <Image src={img(portrait(h))} alt={pic.alt} fill sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw" className="-z-10 object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(12,10,34,0)_35%,rgba(12,10,34,0.92))]" />
                <p className="font-mono text-xs text-white/75">
                  {catNo(h.no)} · {storyChapters(h).length} chapters
                </p>
                <h2 className="display mt-1 text-3xl">{h.name}</h2>
                <p className="mt-1 font-mono text-sm text-white/80">{lifespan(h)}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  Read the story <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </SitePage>
  );
}
