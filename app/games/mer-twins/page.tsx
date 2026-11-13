import { generateSEO } from "@/lib/seo";
import GameShell from "@/app/components/games/shell";
import SunshineGame from "./game";

export const metadata = generateSEO({
  title: "Chasing Sunshine: a Spirit and Opportunity game | Rover Villa",
  description: "Keep a solar-powered Mars rover alive one sol at a time, through dust, winters and storms.",
  path: "/games/mer-twins",
});

export default function Page() {
  return (
    <GameShell
      hero="opportunity"
      title="Chasing Sunshine"
      goal="Keep a solar-powered rover alive, one Martian day at a time. The plan was 90 sols."
      story="Spirit and Opportunity ran on sunlight. Both were planned for 90 sols. Spirit lasted more than six years and Opportunity more than fourteen, until dust and darkness won."
      facts={[
        { value: "90 sols", label: "the planned mission for each twin", source: "https://science.nasa.gov/mission/mer-opportunity/" },
        { value: "45.16 km", label: "how far Opportunity drove across Mars", source: "https://science.nasa.gov/mission/mer-opportunity/" },
        { value: "Tau ≈ 10.8", label: "how thick the dust in the sky was in Opportunity's last storm; about 0.5 is typical there", source: "https://www.jpl.nasa.gov/news/six-things-about-opportunitys-recovery-efforts/" },
        { value: "22 Mar 2010", label: "Spirit's last call home, stuck in sand through the winter", source: "https://science.nasa.gov/mission/mer-spirit/" },
      ]}
    >
      <SunshineGame />
    </GameShell>
  );
}
