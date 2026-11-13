import { generateSEO } from "@/lib/seo";
import GameShell from "@/app/components/games/shell";
import InsightGame from "./game";

export const metadata = generateSEO({
  title: "Marsquake Hunter: an InSight game | Rover Villa",
  description: "Read InSight-style seismograms and work out how far away each marsquake struck.",
  path: "/games/insight-seismology",
});

export default function Page() {
  return (
    <GameShell
      hero="insight"
      title="Marsquake Hunter"
      goal="Mark where the P and S waves arrive and find out how far away each quake struck."
      story="InSight set a seismometer on the ground and listened to Mars for four years. The quakes it heard showed what lies inside: a crust, a mantle and a core."
      facts={[
        { value: "1,319", label: "marsquakes detected by the end of the mission", source: "https://www.jpl.nasa.gov/news/nasa-retires-insight-mars-lander-mission-after-years-of-science/" },
        { value: "6 Apr 2019", label: "the first likely marsquake, on InSight's 128th Martian day", source: "https://science.nasa.gov/photojournal/insights-sol-128-seismic-event/" },
        { value: "Dec 2018", label: "the robotic arm set the seismometer on the surface", source: "https://science.nasa.gov/mission/insight/" },
        { value: "15 Dec 2022", label: "InSight's last contact, its solar panels covered in dust", source: "https://science.nasa.gov/mission/insight/" },
      ]}
    >
      <InsightGame />
    </GameShell>
  );
}
