import { HEROES } from "@/lib/heroes";
import { generateSEO } from "@/lib/seo";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import RestView from "@/app/components/rest/rest-view";

export const metadata = generateSEO({
  title: "Where They Rest: landing sites on Mars and the Moon | Rover Villa",
  description: "Resting among the stars. Find where every rover, lander and probe came to rest on Mars and the Moon.",
  path: "/where-they-rest",
  ogImage: "/images/mars-globe.jpg",
});

export default function WhereTheyRestPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <RestView heroes={HEROES} />
      </main>
      <Footer />
    </>
  );
}
