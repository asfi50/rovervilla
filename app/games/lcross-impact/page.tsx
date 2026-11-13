import { generateSEO } from "@/lib/seo";
import GameShell from "@/app/components/games/shell";
import LcrossGame from "./game";

export const metadata = generateSEO({
  title: "Into the Plume: an LCROSS game | Rover Villa",
  description: "Crash a rocket stage into a dark crater on the Moon, then fly through the plume looking for water.",
  path: "/games/lcross-impact",
});

const NSSDCA = "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2009-031B";
const SCI = "https://science.nasa.gov/mission/lcross/";

export default function Page() {
  return (
    <GameShell
      hero="lcross"
      title="Into the Plume"
      goal="Hit the crater's shadowed floor, then fly under the sunlit plume to read it."
      story="LCROSS steered its spent Centaur rocket stage into Cabeus crater, then flew through the plume it threw up, sending readings home until it hit the crater too."
      facts={[
        { value: "9 Oct 2009", label: "the Centaur struck Cabeus crater at about 2.5 km/s", source: NSSDCA },
        { value: "≈ 4 min", label: "between the Centaur's impact and LCROSS's own", source: SCI },
        { value: "5.6 ± 2.9%", label: "estimated water, by mass, in the soil at the impact site", source: "https://ntrs.nasa.gov/api/citations/20120009955/downloads/20120009955.pdf" },
        { value: "13 Nov 2009", label: "NASA announced that the data showed water", source: SCI },
      ]}
    >
      <LcrossGame />
    </GameShell>
  );
}
