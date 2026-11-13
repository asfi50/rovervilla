import { generateSEO } from "@/lib/seo";
import SitePage from "@/app/components/site-page";
import { ArcadeBoard } from "@/app/components/home/games-section";

export const metadata = generateSEO({
  title: "Games | Rover Villa",
  description: "Free browser games about the machines we left on Mars and the Moon.",
  path: "/games",
});

/** Games: the same arcade board as the home page, with what's coming next underneath. */
export default function GamesPage() {
  return (
    <SitePage eyebrow="Arcade" title="Games">
      <ArcadeBoard rail={false} withSoon />
    </SitePage>
  );
}
