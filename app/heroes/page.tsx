import { HEROES, bodyName, type Body } from "@/lib/heroes";
import { generateSEO } from "@/lib/seo";
import SitePage from "@/app/components/site-page";
import HeroCard from "@/app/components/hero-card";

export const metadata = generateSEO({
  title: "Heroes: the machines we left behind | Rover Villa",
  description: "Every rover, lander and probe in the archive, from Ranger 7 to Ingenuity.",
  path: "/heroes",
});

export default function HeroesPage() {
  return (
    <SitePage eyebrow="The archive" title="Heroes" lede="They went where we couldn’t, and they never came back. Each one has a catalogue number, a birthday and a last signal.">
      <div className="space-y-14">
        {(["mars", "moon"] as Body[]).map((b) => {
          const list = HEROES.filter((h) => h.body === b);
          return (
            <section key={b} aria-labelledby={`h-${b}`}>
              <div className="mb-5 flex items-baseline gap-4 border-b border-line pb-3">
                <h2 id={`h-${b}`} className="display text-4xl">{bodyName(b)}</h2>
                <span className="font-mono text-sm">· {list.length} machines</span>
              </div>
              <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {list.map((h) => (
                  <li key={h.slug} data-reveal>
                    <HeroCard hero={h} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </SitePage>
  );
}
