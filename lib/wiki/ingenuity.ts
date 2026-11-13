import type { WikiEntry } from "./types";

export const INGENUITY: WikiEntry = {
  lead: "Ingenuity was a small NASA helicopter that rode to Mars under the Perseverance rover and, on 19 April 2021, made the first powered, controlled flight on another planet. Built for up to five test flights in 30 days, it flew 72 times over almost three years, until a damaged rotor blade grounded it in January 2024.",
  sections: [
    {
      id: "why",
      title: "Why it was built",
      paras: [
        "Ingenuity was a technology demonstration: could anything fly in an atmosphere less than 1 percent as dense as Earth's? It weighed 1.8 kg, with rotors about 1.2 m tip to tip, and a solar panel that charged its lithium-ion batteries with enough energy for one 90-second flight per Martian day. It was built by NASA's Jet Propulsion Laboratory.",
        "It carried a swatch of fabric from the original Wright Flyer.",
      ],
    },
    {
      id: "first",
      title: "A Wright Brothers moment",
      paras: [
        "Ingenuity launched with Perseverance on 30 July 2020 and landed with it in Jezero crater on 18 February 2021, folded beneath the rover. On 3 April 2021 it was set down on the surface, and on 19 April it lifted off: the first powered, controlled flight on another planet, a feat called a \"Wright Brothers moment.\"",
      ],
    },
    {
      id: "scout",
      title: "From test to scout",
      paras: [
        "After four more test flights it began a new job as an aerial scout for Perseverance's scientists and rover drivers. Over an extended mission of almost 1,000 Martian days, more than 33 times longer than planned, it learned to choose landing sites on its own in treacherous terrain, coped with a dead sensor, cleaned itself after dust storms, flew from 48 different airfields, made three emergency landings and survived a frigid winter it was never designed for.",
        "In all it flew 128.8 minutes, covered 17.0 km and climbed as high as 24 m: more than 14 times farther than planned.",
      ],
    },
    {
      id: "end",
      title: "The last flight",
      paras: [
        "On 18 January 2024 Ingenuity made a short vertical flight to work out its location after an emergency landing on the previous flight. It climbed to 12 m, hovered for 4.5 seconds and started down at 1 m per second. About 1 m above the ground it lost contact with the rover, its relay to Earth.",
        "Contact came back the next day. Images that arrived several days later showed that one or more rotor blades had been damaged during landing. Ingenuity stayed upright and in contact, but could no longer fly, and NASA ended the mission on 25 January 2024.",
      ],
    },
  ],
  timeline: [
    { date: "30 July 2020", text: "Launches with Perseverance from Cape Canaveral." },
    { date: "18 February 2021", text: "Lands in Jezero crater under the rover." },
    { date: "3 April 2021", text: "Placed on the Martian surface." },
    { date: "19 April 2021", text: "First powered, controlled flight on another planet." },
    { date: "2021–2023", text: "Becomes an aerial scout; flies through a Martian winter." },
    { date: "18 January 2024", text: "72nd and final flight; a rotor blade is damaged on landing." },
    { date: "25 January 2024", text: "NASA ends the mission." },
  ],
  facts: [
    { label: "Built by", value: "NASA JPL" },
    { label: "Mass", value: "1.8 kg" },
    { label: "Rotors", value: "About 1.2 m tip to tip" },
    { label: "Flights", value: "72" },
    { label: "Flight time", value: "128.8 minutes" },
    { label: "Distance", value: "17.0 km" },
    { label: "Highest", value: "24.0 m" },
    { label: "Mission ended", value: "25 January 2024" },
  ],
  sources: [
    { label: "NASA Science: Ingenuity Mars Helicopter", url: "https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/" },
    { label: "NASA: After Three Years on Mars, NASA's Ingenuity Helicopter Mission Ends", url: "https://www.nasa.gov/news-release/after-three-years-on-mars-nasas-ingenuity-helicopter-mission-ends/" },
  ],
};
