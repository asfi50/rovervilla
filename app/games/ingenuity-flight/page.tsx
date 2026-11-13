import { generateSEO } from "@/lib/seo";
import GameShell from "@/app/components/games/shell";
import IngenuityGame from "./game";

export const metadata = generateSEO({
  title: "Thin Air: an Ingenuity helicopter game | Rover Villa",
  description: "Fly a helicopter on Mars: climb, hover and land gently in very thin air.",
  path: "/games/ingenuity-flight",
});

const SCI = "https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/";
const FIRST = "https://www.nasa.gov/news-release/nasas-ingenuity-mars-helicopter-succeeds-in-historic-first-flight/";

export default function Page() {
  return (
    <GameShell
      hero="ingenuity"
      title="Thin Air"
      goal="Hold to spin the rotors. Climb, hover in the band, then land gently."
      story="Ingenuity was a test: could anything fly in Mars's thin air? Its first hop proved it could. Planned for five flights, it flew 72."
      facts={[
        { value: "19 Apr 2021", label: "first powered, controlled flight on another planet: 3 m up, 39.1 seconds", source: FIRST },
        { value: "1.8 kg", label: "the whole helicopter, about as heavy as a big bottle of water", source: SCI },
        { value: "72", label: "flights in all, adding up to 128.8 minutes in the air", source: SCI },
        { value: "18 Jan 2024", label: "its last flight, after which a damaged blade kept it grounded", source: "https://www.jpl.nasa.gov/news/nasa-performs-first-aircraft-accident-investigation-on-another-world/" },
      ]}
    >
      <IngenuityGame />
    </GameShell>
  );
}
