import { BASE_URL } from "@/lib/seo";
import { type Hero, img, portrait } from "@/lib/heroes";

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function WebSiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Rover Villa",
        url: BASE_URL,
        description: "A memorial for the machines we left behind on Mars and the Moon.",
      }}
    />
  );
}

export function HeroSchema({ hero }: { hero: Hero }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: `${hero.name}: ${hero.designation}`,
        description: hero.summary,
        image: `${BASE_URL}${img(portrait(hero))}`,
        url: `${BASE_URL}/heroes/${hero.slug}`,
        about: { "@type": "Thing", name: hero.name, description: hero.designation },
        citation: hero.sources.map((s) => s.url),
      }}
    />
  );
}
