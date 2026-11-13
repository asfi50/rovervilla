import { generateSEO } from "@/lib/seo";
import GameShell from "@/app/components/games/shell";
import GrailGame from "./game";

export const metadata = generateSEO({
  title: "Ebb & Flow: a GRAIL gravity game | Rover Villa",
  description: "Fly GRAIL's twin spacecraft over the Moon and find the hidden masses from the gap between them.",
  path: "/games/grail-gravity",
});

const SCI = "https://science.nasa.gov/mission/grail/";
const NSSDCA = "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2011-046A";

export default function Page() {
  return (
    <GameShell
      hero="grail"
      title="Ebb & Flow"
      goal="Watch the gap between two spacecraft, then find the heavy patches hidden under the Moon."
      story="GRAIL's twins measured, with a radio link, how fast the distance between them changed. Those tiny changes mapped the Moon's gravity, inside and out."
      facts={[
        { value: "2", label: "spacecraft, Ebb and Flow, flying one behind the other", source: SCI },
        { value: "Range-rate", label: "what the radio link measured: how fast the gap changed", source: NSSDCA },
        { value: "Mascons", label: "heavy patches under the surface that GRAIL pinpointed", source: SCI },
        { value: "17 Dec 2012", label: "both flown into a mountain near the north pole; the site is named for Sally Ride", source: SCI },
      ]}
    >
      <GrailGame />
    </GameShell>
  );
}
