import { generateSEO } from "@/lib/seo";
import GameShell from "@/app/components/games/shell";
import PolarGame from "./game";

export const metadata = generateSEO({
  title: "Trust the Signal: a Mars Polar Lander game | Rover Villa",
  description: "Be the landing computer and decide when the lander has really touched down on Mars.",
  path: "/games/polar-lander-forensics",
});

const SCI = "https://science.nasa.gov/mission/mars-polar-lander-deep-space-2/";
const REPORT = "https://assets.science.nasa.gov/content/dam/science/psd/solar/internal_resources/details/original/3338_mpl_report_1.pdf?emrc=6af03574bf278";

export default function Page() {
  return (
    <GameShell
      hero="mars-polar-lander"
      title="Trust the Signal"
      goal="Be the landing computer: shut the engines off only when the lander is really down."
      story="Mars Polar Lander went silent as it began its descent and was never heard from again. With no data from the descent, the cause can't be proven, but the review board's most likely answer is a false touchdown signal."
      facts={[
        { value: "3 Dec 1999", label: "last contact, just before entering the atmosphere", source: SCI },
        { value: "No data", label: "the lander sent nothing home during its descent", source: REPORT },
        { value: "Leg jolt", label: "unfolding legs could trip the touchdown sensors for a moment", source: REPORT },
        { value: "0", label: "signals from the surface, and none from the two Deep Space 2 probes", source: SCI },
      ]}
    >
      <PolarGame />
    </GameShell>
  );
}
