import type { WikiEntry } from "./types";

export const LCROSS: WikiEntry = {
  lead: "LCROSS, the Lunar Crater Observation and Sensing Satellite, was built to find out whether water ice exists in a permanently shadowed crater at the Moon's south pole. On 9 October 2009 it crashed its spent rocket stage into Cabeus crater, flew through the plume, and then hit the Moon itself. Its data showed water.",
  sections: [
    {
      id: "why",
      title: "Why it was built",
      paras: [
        "Like the Lunar Reconnaissance Orbiter it launched with, LCROSS was meant to confirm water ice in a permanently shadowed crater at the lunar south pole, and to test new modular subsystems for future missions. Both were part of NASA's Lunar Precursor Robotic Program and were first funded under the Constellation program to return people to the Moon.",
        "The plan was unusual: crash the rocket's Centaur upper stage into the crater, fly LCROSS through the debris plume about four minutes later to measure it, then let LCROSS hit the Moon too.",
      ],
    },
    {
      id: "flight",
      title: "A long way round",
      paras: [
        "LCROSS and LRO launched together on 18 June 2009. After LRO separated, the Centaur and LCROSS stayed joined, swung past the Moon on 23 June and entered a looping Earth orbit with a period of 37 days, passing near the Moon on 10 July, 16 August and 22 September before their path met the Moon on 9 October.",
        "On 22 August controllers found that a sensor problem had made the spacecraft burn through 140 kg of propellant, more than half of what remained. The mission could still be done, but with very little margin.",
      ],
    },
    {
      id: "impact",
      title: "Two impacts",
      paras: [
        "The Centaur and LCROSS separated at 01:50 UT on 9 October 2009. At 11:31 UT the Centaur hit Cabeus crater, excavating roughly 350 tonnes of lunar material and leaving a crater about 20 m across. Four minutes later LCROSS flew through the plume, collecting data, and struck the Moon at 11:36 UT at about 9,000 km/h. LRO watched the Centaur's impact point in infrared about 90 seconds after the crash.",
      ],
    },
    {
      id: "results",
      title: "Water",
      paras: [
        "On 13 November 2009 NASA announced that LCROSS data \"indicates that the mission successfully uncovered water … near the Moon's south pole.\" On 21 October 2010 scientists added that the soil in Cabeus was rich in useful materials, including mercury, magnesium, calcium, silver and sodium, that the Moon is chemically active and has a water cycle, and that in some places the water is pure ice crystals.",
      ],
    },
  ],
  timeline: [
    { date: "18 June 2009", text: "Launch with the Lunar Reconnaissance Orbiter." },
    { date: "23 June 2009", text: "Lunar flyby into a long Earth orbit." },
    { date: "22 August 2009", text: "A sensor problem burns 140 kg of propellant." },
    { date: "9 October 2009", text: "Centaur hits Cabeus at 11:31 UT; LCROSS follows at 11:36 UT." },
    { date: "13 November 2009", text: "NASA announces water near the south pole." },
    { date: "21 October 2010", text: "More results: useful materials and pure ice crystals." },
  ],
  facts: [
    { label: "Launch", value: "18 June 2009, with LRO" },
    { label: "Impact", value: "9 October 2009, 11:36 UT" },
    { label: "Target", value: "Cabeus crater, lunar south pole" },
    { label: "Centaur crater", value: "About 20 m across" },
    { label: "Material thrown up", value: "About 350 tonnes" },
    { label: "Instruments", value: "Visible, near- and mid-infrared cameras; spectrometers; photometer" },
  ],
  sources: [
    { label: "NASA Science: LCROSS", url: "https://science.nasa.gov/mission/lcross/" },
    { label: "NASA: What is LCROSS?", url: "https://www.nasa.gov/general/what-is-lcross-the-lunar-crater-observation-and-sensing-satellite/" },
  ],
};
