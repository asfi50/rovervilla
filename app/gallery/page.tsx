import Link from "next/link";
import { HEROES } from "@/lib/heroes";
import { photo } from "@/lib/photos";
import { generateSEO } from "@/lib/seo";
import SitePage from "@/app/components/site-page";
import Gallery from "@/app/components/profile/gallery";

export const metadata = generateSEO({
  title: "Gallery | Rover Villa",
  description: "Photos of the machines we left on Mars and the Moon.",
  path: "/gallery",
});

export default function GalleryPage() {
  return (
    <SitePage
      eyebrow="Gallery"
      title="Their last views."
      lede="Real photos from NASA's public image archive, credited one by one. Tap any picture for its title, credit and source."
    >
      <div className="space-y-12">
        {HEROES.filter((h) => h.gallery.length > 0).map((h) => (
          <section key={h.slug} data-reveal>
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="display text-3xl">{h.name}</h2>
              <Link href={`/heroes/${h.slug}`} className="text-sm font-semibold text-brand hover:underline">
                Read their story
              </Link>
            </div>
            <Gallery items={h.gallery.map((n) => photo(n, h.name))} name={h.name} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" />
          </section>
        ))}
      </div>
    </SitePage>
  );
}
