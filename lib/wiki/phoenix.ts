import type { WikiEntry } from "./types";

export const PHOENIX: WikiEntry = {
  lead: "Phoenix was a NASA lander built to study the Martian arctic, the history of its water and whether the site could ever have supported life. It landed farther north than any mission before it on 25 May 2008, dug down to ice just under the soil, and fell silent as winter came in November 2008.",
  sections: [
    {
      id: "why",
      title: "Why it was built",
      paras: [
        "In the search for water on Mars, the polar regions are a good place to dig, because water ice is found there. Phoenix was designed to study the history of water in the Martian arctic and to search for complex organic molecules, checking soil and ice for evidence of whether the site was ever hospitable to life.",
      ],
    },
    {
      id: "landing",
      title: "Arctic touchdown",
      paras: [
        "Phoenix launched on 4 August 2007. It entered the atmosphere at nearly 21,000 km/h on 25 May 2008 and touched down at 23:38:38 UT in the Green Valley of Vastitas Borealis, at 68.22° N, a latitude like northern Alaska's. It was the first successful landing of a stationary lander on Mars since Viking 2, about 32 years earlier.",
        "On the way down, Mars Reconnaissance Orbiter's HiRISE camera photographed Phoenix hanging from its parachute, the first time one spacecraft photographed another during a planetary landing.",
      ],
    },
    {
      id: "ice",
      title: "Ice",
      paras: [
        "Phoenix waited 15 minutes for the dust to settle before unfurling its solar panels. Within four days it had sent a 360-degree panorama of a flat plain marked by pebbles and troughs, deployed its 2.5 m robotic arm and begun daily weather reports.",
        "On 31 May the arm began scooping soil. By 19 June scientists concluded that bright clumps in a trench nicknamed Dodo-Goldilocks were probably water ice, because they had vaporised four days after the scoop. On 31 July NASA announced that the Thermal and Evolved Gas Analyzer had confirmed water in a sample.",
      ],
    },
    {
      id: "chemistry",
      title: "Perchlorate",
      paras: [
        "On 5 August 2008 the team announced perchlorate in the soil, a chemical that is a possible energy source for microbes and a potential resource for human explorers, though it neither confirmed nor ruled out life. Its wet chemistry lab found the soil alkaline, with salts including perchlorate, sodium, magnesium, chloride and potassium. The results led scientists to revisit Viking's data.",
        "Phoenix also scanned the atmosphere up to 20 km for clouds, fog and dust.",
      ],
    },
    {
      id: "end",
      title: "Winter",
      paras: [
        "Phoenix finished its planned 90-day mission by the end of August 2008 and was extended to 30 September. As the arctic winter approached, extreme cold and fading sunlight left it without power. It operated until 2 November 2008, 67 sols beyond its expected lifetime.",
      ],
    },
  ],
  timeline: [
    { date: "4 August 2007", text: "Launch on a Delta II." },
    { date: "25 May 2008", text: "Lands in Vastitas Borealis at 23:38:38 UT." },
    { date: "31 May 2008", text: "Robotic arm starts sampling soil for ice." },
    { date: "19 June 2008", text: "Bright clumps in a trench are identified as probable water ice." },
    { date: "31 July 2008", text: "NASA announces TEGA has confirmed water." },
    { date: "5 August 2008", text: "Perchlorate found in the soil." },
    { date: "Late August 2008", text: "Planned 90-day mission complete; extended." },
    { date: "2 November 2008", text: "Last signal as winter sets in." },
  ],
  facts: [
    { label: "Launch", value: "4 August 2007, Delta II 7925" },
    { label: "Landing", value: "25 May 2008, 23:38:38 UT" },
    { label: "Site", value: "Vastitas Borealis, 68.22° N, 234.25° E" },
    { label: "Robotic arm", value: "About 2.5 m" },
    { label: "Camera mast", value: "2 m" },
    { label: "Last signal", value: "2 November 2008" },
  ],
  sources: [
    { label: "NASA Science: Phoenix", url: "https://science.nasa.gov/mission/phoenix/" },
    { label: "NASA History: 25 Years of Continuous Robotic Mars Exploration", url: "https://www.nasa.gov/history/25-years-of-continuous-robotic-mars-exploration-from-pathfinder-to-perseverance/" },
  ],
};
