import type { WikiEntry } from "./types";

export const INSIGHT: WikiEntry = {
  lead: "InSight was a NASA lander built to study the deep interior of Mars, taking the planet's \"vital signs\": its pulse, temperature and reflexes. It landed on Elysium Planitia in November 2018, recorded 1,319 marsquakes, and fell silent in December 2022 as dust covered its solar panels.",
  sections: [
    {
      id: "why",
      title: "Why it was built",
      paras: [
        "InSight, short for Interior Exploration using Seismic Investigations, Geodesy and Heat Transport, set out to learn how the rocky planets of the inner solar system formed by studying the inside of Mars: how active it is today and how often meteorites strike it.",
        "It landed near the equator on the western side of Elysium Planitia, at about 4.5° N, 135.9° E, about 600 km from Curiosity's landing site. The flat, smooth plain was chosen for safety, because InSight's work was underground, not on the surface. The lander was built by Lockheed Martin on the design of NASA's Phoenix lander.",
      ],
    },
    {
      id: "instruments",
      title: "Listening to Mars",
      paras: [
        "Its robotic arm, more than 1.8 m long, lifted a seismometer and a heat-flow probe off the deck and set them on the ground. The seismometer, SEIS, was provided by the French space agency CNES and placed on 19 December 2018; a dome-shaped Wind and Thermal Shield built by JPL protected it from wind and temperature swings.",
        "On 6 April 2019, the 128th Martian day of the mission, SEIS recorded the first trembling that appeared to come from inside the planet. Mars has no tectonic plates; its quakes come from the planet slowly cooling and contracting until the crust breaks.",
      ],
    },
    {
      id: "mole",
      title: "The mole",
      paras: [
        "The heat probe, provided by the German Aerospace Center, had a self-hammering spike nicknamed \"the mole\" meant to dig 5 m down. Designed for loose, sandy soil, it could not get traction in the unexpectedly clumpy soil, and buried its 40 cm probe only just below the surface, still gathering useful data about the soil.",
      ],
    },
    {
      id: "results",
      title: "What it found",
      paras: [
        "SEIS detected 1,319 marsquakes, including some caused by meteoroid impacts. InSight's data revealed details about the planet's interior layers, the surprisingly strong remains of its extinct magnetic field beneath the surface, and the weather at the landing site. It also recorded the low rumble of Martian wind.",
      ],
    },
    {
      id: "end",
      title: "Dust",
      paras: [
        "Dust gradually built up on the solar panels and cut the lander's power. The team even used the arm's scoop to sprinkle dirt onto the panels on windy days, so falling grains would sweep dust away. InSight took its final selfie on 24 April 2022, far dustier than its first.",
        "The seismometer was the last instrument left running. InSight last communicated with Earth on 15 December 2022. After it missed two consecutive contact attempts, NASA concluded its batteries had run out of energy and declared the mission over.",
      ],
    },
  ],
  timeline: [
    { date: "5 May 2018", text: "Launch from Vandenberg on an Atlas V, with two MarCO CubeSats." },
    { date: "26 November 2018", text: "Lands on Elysium Planitia." },
    { date: "19 December 2018", text: "Seismometer placed on the surface." },
    { date: "6 April 2019", text: "First likely marsquake recorded." },
    { date: "24 April 2022", text: "Final selfie, covered in dust." },
    { date: "15 December 2022", text: "Last communication with Earth." },
    { date: "December 2022", text: "NASA retires the mission after two missed contacts." },
  ],
  facts: [
    { label: "Built by", value: "Lockheed Martin" },
    { label: "Launch", value: "5 May 2018, Atlas V 401, Vandenberg" },
    { label: "Landing", value: "26 November 2018, Elysium Planitia" },
    { label: "Site", value: "About 4.5° N, 135.9° E" },
    { label: "Robotic arm", value: "More than 1.8 m" },
    { label: "Marsquakes", value: "1,319" },
    { label: "Last contact", value: "15 December 2022" },
  ],
  sources: [
    { label: "NASA Science: InSight", url: "https://science.nasa.gov/mission/insight/" },
    { label: "NASA: NASA Retires InSight Mars Lander Mission After Years of Science", url: "https://www.nasa.gov/missions/insight/nasa-retires-insight-mars-lander-mission-after-years-of-science/" },
    { label: "NASA Science: NASA's InSight Detects First Likely 'Quake' on Mars", url: "https://science.nasa.gov/missions/insight/nasas-insight-detects-first-likely-quake-on-mars/" },
    { label: "NASA: InSight's Final Selfie", url: "https://www.nasa.gov/image-article/insights-final-selfie/" },
  ],
};
