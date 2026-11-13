import { generateSEO } from "@/lib/seo";
import GameShell from "@/app/components/games/shell";
import VikingGame from "./game";

export const metadata = generateSEO({
  title: "Is Anything Alive? A Viking soil lab game | Rover Villa",
  description: "Run Viking's soil tests on Mars and decide what the results mean.",
  path: "/games/viking-biology",
});

export default function Page() {
  return (
    <GameShell
      hero="viking-1"
      title="Is Anything Alive?"
      goal="Run Viking's soil tests, then decide: life, chemistry, or too soon to say?"
      story="Viking 1 scooped Martian soil into a tiny biology lab in 1976. One test gave a surprising result, but the others didn't back it up. Most scientists think chemistry explains it; the debate never fully ended."
      facts={[
        { value: "20 Jul 1976", label: "Viking 1 lands and takes the first photo on the surface of Mars", source: "https://science.nasa.gov/mission/viking-1/" },
        { value: "3 + 1", label: "three biology experiments, plus an instrument searching for organic molecules", source: "https://science.nasa.gov/mission/viking/spacecraft-and-science/" },
        { value: "Inconclusive", label: "how the life-search results are described", source: "https://science.nasa.gov/mission/viking-1/" },
        { value: "2008", label: "Phoenix finds perchlorate, a clue to Viking's puzzling results", source: "https://www.jpl.nasa.gov/news/missing-piece-inspires-new-look-at-mars-puzzle/" },
      ]}
    >
      <VikingGame />
    </GameShell>
  );
}
