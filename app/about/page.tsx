import Link from "next/link";
import { HEROES } from "@/lib/heroes";
import { generateSEO } from "@/lib/seo";
import SitePage from "@/app/components/site-page";
import { Waveform } from "@/app/components/waveform";
import { ArrowRight } from "@/app/components/icons";

export const metadata = generateSEO({
  title: "About | Rover Villa",
  description: "They had names, birthdays and last words, just like us. Why we built a memorial for the machines we left behind.",
  path: "/about",
});

const RULES = [
  { title: "Facts only", text: "Every date, number and last word comes from a real mission record, and each hero lists its sources. We never invent quotes." },
  { title: "Real imagery", text: "We use public-domain mission photos and videos, and credit every one." },
  { title: "Independent", text: "Rover Villa is not affiliated with or endorsed by any space agency, and carries no agency branding." },
];

export default function AboutPage() {
  return (
    <SitePage eyebrow="About" title="They had names, birthdays and last words, just like us.">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5 text-lg leading-relaxed" data-reveal>
          <p>
            Rovers, landers and probes went where we couldn’t, and they never came back. Their missions are over, but they are still out
            there, on the plains of Mars and the dust of the Moon.
          </p>
          <p>
            We remember them the way we remember great people: where they were born, the life they lived, what they discovered, and
            their last signal home. The archive holds {HEROES.length} of them today, from Ranger 7 in 1964 to Ingenuity.
          </p>
          <Waveform seed="about" bars={40} live className="h-12 w-72 text-brand" />
          <Link href="/heroes" className="inline-flex items-center gap-3 rounded-full bg-brand px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-brand-deep">
            Meet the heroes <ArrowRight />
          </Link>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {RULES.map((r, i) => (
            <li key={r.title} className="rounded-2xl border border-line bg-mist p-6 sm:last:col-span-2" data-reveal>
              <p className="font-mono text-xs">0{i + 1}</p>
              <h2 className="display mt-2 text-2xl">{r.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{r.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </SitePage>
  );
}
