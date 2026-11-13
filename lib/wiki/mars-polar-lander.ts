import type { WikiEntry } from "./types";

export const MARS_POLAR_LANDER: WikiEntry = {
  lead: "Mars Polar Lander was a NASA mission to set down near the edge of Mars' south polar cap and dig for water ice with a robotic arm. It arrived on 3 December 1999, contact ended as planned before entry, and it was never heard from again. An investigation found that it most likely crashed.",
  sections: [
    {
      id: "why",
      title: "Why it was built",
      paras: [
        "The lander was designed to touch down on the frigid terrain near the south polar cap and look for water ice with a robotic arm. Riding along were two small Deep Space 2 probes, meant to hit the surface, test new technologies and study the subsurface down to about one metre.",
      ],
    },
    {
      id: "arrival",
      title: "Arrival day",
      paras: [
        "It launched on a Delta II from Cape Canaveral on 3 January 1999. On 3 December 1999, as it separated from its cruise stage to begin entry, descent and landing, contact ceased, as planned. After the expected touchdown, controllers could not re-establish communications, and the two Deep Space 2 probes were never heard from either. NASA ended attempts to contact the lander on 17 January 2000.",
        "It came less than three months after the loss of its companion, the Mars Climate Orbiter, on 23 September 1999.",
      ],
    },
    {
      id: "cause",
      title: "What went wrong",
      paras: [
        "An investigation found that the most likely cause was a false signal that the spacecraft had already landed. That signal shut down the main engines early, and the lander crashed into the surface.",
      ],
    },
  ],
  timeline: [
    { date: "3 January 1999", text: "Launch on a Delta II from Launch Complex 17B." },
    { date: "23 September 1999", text: "The companion Mars Climate Orbiter is lost." },
    { date: "3 December 1999", text: "Arrival at Mars; contact ends before entry and never returns." },
    { date: "17 January 2000", text: "NASA ends attempts to contact the lander." },
  ],
  facts: [
    { label: "Launch", value: "3 January 1999, Delta II 7425" },
    { label: "Arrival", value: "3 December 1999" },
    { label: "Target", value: "Near the south polar cap" },
    { label: "Passengers", value: "Two Deep Space 2 probes" },
    { label: "Likely cause of loss", value: "False touchdown signal shut down the engines early" },
  ],
  sources: [
    { label: "NASA Science: Mars Polar Lander / Deep Space 2", url: "https://science.nasa.gov/mission/mars-polar-lander-deep-space-2/" },
    { label: "NASA History: 25 Years of Continuous Robotic Mars Exploration", url: "https://www.nasa.gov/history/25-years-of-continuous-robotic-mars-exploration-from-pathfinder-to-perseverance/" },
    { label: "Photojournal: PIA02349", url: "https://photojournal.jpl.nasa.gov/catalog/PIA02349" },
  ],
};
