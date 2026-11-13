import { generateSEO } from "@/lib/seo";
import GameShell from "@/app/components/games/shell";
import RangerGame from "./game";

export const metadata = generateSEO({
  title: "Last Pictures: a Ranger 7 game | Rover Villa",
  description: "Fall toward the Moon with Ranger 7 and keep taking pictures until the very end.",
  path: "/games/ranger-7-dive",
});

const NSSDCA = "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1964-041A";
const HISTORY = "https://www.nasa.gov/history/60-years-ago-ranger-7-photographs-the-moon/";

export default function Page() {
  return (
    <GameShell
      hero="ranger-7"
      title="Last Pictures"
      goal="Fall toward the Moon and take as many pictures as you can before the end."
      story="Ranger 7 was built to crash. It switched its cameras on 17 minutes out and kept sending pictures until 2.3 seconds before it hit the Moon."
      facts={[
        { value: "4,308", label: "pictures sent in the last 17 minutes", source: NSSDCA },
        { value: "2,110 km", label: "altitude of the first picture", source: HISTORY },
        { value: "2.62 km/s", label: "speed when it struck the Moon", source: NSSDCA },
        { value: "Mare Cognitum", label: "where it landed, later named the Known Sea", source: "https://science.nasa.gov/mission/ranger-7/" },
      ]}
    >
      <RangerGame />
    </GameShell>
  );
}
