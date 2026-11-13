import Image from "next/image";
import Link from "next/link";
import { HEROES, lifespan } from "@/lib/heroes";
import Globe from "@/app/components/globe";
import { ArrowRight } from "@/app/components/icons";

/**
 * The family selfie: one AI-made picture of rovers, landers and a helicopter crowding in for a
 * group photo, a rover holding the camera on its arm. Text at left on desktop, above the picture on phones.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div className="mx-auto grid max-w-[1440px] items-center gap-2 px-4 pt-6 pb-6 sm:px-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-6 lg:pt-6 lg:pb-6">
        <div className="lg:py-10">
          <h1 className="display rise max-w-[11ch] text-[36px] leading-[1.02] sm:text-5xl lg:text-[60px] xl:text-[68px]">
            Their mission ended. <span className="text-brand">Their story didn’t.</span>
          </h1>
          <Link
            href="#famous"
            className="rise mt-5 inline-flex w-fit items-center gap-3 rounded-full bg-brand px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_30px_-10px_rgba(18,56,255,0.6)] transition-colors hover:bg-brand-deep lg:mt-7"
            style={{ animationDelay: "120ms" }}
          >
            Meet the heroes <ArrowRight />
          </Link>
        </div>
        {/* The picture's own background is white; a soft mask melts its edges into the page. */}
        <div className="rise relative -mx-4 aspect-[3/2] sm:mx-0" style={{ animationDelay: "160ms" }}>
          <Image
            src="/images/hero-family.webp"
            alt="Illustration of old Mars and Moon rovers, landers and a helicopter crowding in for a group selfie"
            fill
            priority
            sizes="(min-width:1024px) 60vw, 100vw"
            className="object-contain [mask-image:radial-gradient(ellipse_at_center,#000_62%,transparent_100%)]"
          />
        </div>
      </div>
    </section>
  );
}

export function Ticker() {
  const items = HEROES.map((h) => `${h.name} ${lifespan(h)}`);
  const row = items.join("  ·  ") + "  ·  ";
  return (
    <div className="relative z-10 -mt-12 -rotate-1 overflow-hidden bg-brand py-3 font-mono text-[13px] tracking-[0.12em] text-white uppercase sm:py-3.5 sm:text-base" aria-hidden>
      <div className="ticker flex w-max whitespace-pre">
        <span>{row}</span>
        <span>{row}</span>
      </div>
    </div>
  );
}

const sitesOn = (body: "mars" | "moon") =>
  HEROES.filter((h) => h.body === body).map((h) => ({ id: h.slug, name: h.name, lat: h.coords.lat, lon: h.coords.lon }));

export function Resting() {
  return (
    <section className="overflow-hidden bg-mist">
      <div className="mx-auto grid grid-cols-1 max-w-[1440px] items-center gap-6 px-4 pt-10 sm:px-8 lg:grid-cols-[1fr_1.3fr] lg:gap-10 lg:pt-0">
        <div className="lg:py-24" data-reveal>
          <span className="sticker bg-white text-brand max-sm:hidden">3D map</span>
          <h2 className="display text-4xl sm:mt-4 sm:text-5xl lg:text-6xl">Resting among the stars.</h2>
          <p className="mt-3 max-w-md text-ink-soft sm:mt-4 sm:text-lg">Spin both worlds and find where each one stopped.</p>
          <Link
            href="/where-they-rest"
            className="mt-5 inline-flex items-center gap-3 rounded-full bg-brand px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-deep sm:mt-8"
          >
            Where they rest <ArrowRight />
          </Link>
        </div>
        {/* both worlds whole, Mars big and the Moon riding beside it */}
        <Link
          href="/where-they-rest"
          aria-label="Open the map of resting places"
          className="relative flex items-center justify-center gap-[4%] pb-10 sm:pb-14 lg:py-16"
        >
          <Globe body="mars" sites={sitesOn("mars")} interactive={false} autoRotate labels="none" pin="sm" start={{ lat: 15, lon: -30 }} className="w-[58%] max-w-[400px]" />
          <Globe body="moon" sites={sitesOn("moon")} interactive={false} autoRotate labels="none" pin="sm" start={{ lat: 10, lon: 0 }} className="w-[28%] max-w-[180px] self-start" />
        </Link>
      </div>
    </section>
  );
}
