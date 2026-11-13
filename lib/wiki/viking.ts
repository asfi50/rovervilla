import type { WikiEntry } from "./types";

const VIKING_SOURCES = [
  { label: "NASA Science: Viking 1", url: "https://science.nasa.gov/mission/viking-1/" },
  { label: "NASA Science: Viking 2", url: "https://science.nasa.gov/mission/viking-2/" },
  { label: "NASA History: 45 Years Ago, Viking 1 Touches Down on Mars", url: "https://www.nasa.gov/history/45-years-ago-viking-1-touches-down-on-mars/" },
];

const WHY = {
  id: "why",
  title: "Why they were built",
  paras: [
    "Viking was a pair of complex deep-space probes designed to reach Mars and look for evidence of life. Each spacecraft had two parts: an orbiter of 2,339 kg and a lander of 978 kg. The orbiters photographed the planet and relayed data; the landers carried cameras, a seismometer, a weather station, an X-ray fluorescence spectrometer, a gas chromatograph mass spectrometer and a biology laboratory fed by a robot arm.",
  ],
};

export const VIKING_1: WikiEntry = {
  lead: "Viking 1 made the first truly successful landing on Mars on 20 July 1976 and sent back the first pictures from the surface. Its lander worked for more than six years, until a faulty command from Earth cut the link in November 1982.",
  sections: [
    WHY,
    {
      id: "swap",
      title: "Swapped before launch",
      paras: [
        "Before launch, the batteries of the spacecraft meant to fly first were discharged, so NASA swapped it for the second one, which launched as Viking 1 on 20 August 1975. After three course corrections it entered Mars orbit on 19 June 1976.",
      ],
    },
    {
      id: "landing",
      title: "Landing on the Golden Plain",
      paras: [
        "Orbiter photos showed the planned site in Chryse was rougher than expected, so the lander was retargeted to the western slopes of Chryse Planitia, the Golden Plain. It separated at 08:32 UT on 20 July 1976, sampled the air on the way down, and set down at 11:53:06 UT at 22.483° N, 47.94° W, about 28 km from its target.",
        "The Soviet Mars 3 lander had made a survivable landing in 1971, but contact was lost seconds after touchdown, so Viking 1's was the first truly successful landing.",
      ],
    },
    {
      id: "science",
      title: "Looking for life",
      paras: [
        "The lander photographed its surroundings in three colours and took a 300-degree panorama of gently rolling plains. It measured temperatures from −86 °C before dawn to −33 °C in the afternoon. Its seismometer did not work.",
        "On 28 July 1976 the robot arm scooped the first soil samples into the biology laboratory. The combined results from four samples could have been read as a weak positive sign of life, but the gas chromatograph found no organic compounds, a negative result.",
      ],
    },
    {
      id: "end",
      title: "Six years on Mars",
      paras: [
        "The primary mission ended in November 1976, followed by extended and continuation missions. The lander kept sending daily, then weekly, weather reports. In January 1982 it was renamed the Thomas Mutch Memorial Station, after the leader of the Viking imaging team.",
        "On 11 November 1982 a faulty command sent from Earth interrupted communications, and attempts to regain contact failed. Together the two Viking landers returned 4,500 photos of their landing sites, and the orbiters 52,663 images of Mars.",
      ],
    },
  ],
  timeline: [
    { date: "20 August 1975", text: "Launch on a Titan IIIE-Centaur." },
    { date: "19 June 1976", text: "Enters orbit around Mars." },
    { date: "20 July 1976", text: "Lander touches down on Chryse Planitia at 11:53:06 UT." },
    { date: "28 July 1976", text: "First soil sample scooped for the biology lab." },
    { date: "November 1976", text: "Primary mission ends; extended missions begin." },
    { date: "January 1982", text: "Renamed the Thomas Mutch Memorial Station." },
    { date: "11 November 1982", text: "A faulty command from Earth ends contact." },
  ],
  facts: [
    { label: "Lander mass", value: "978 kg" },
    { label: "Launch", value: "20 August 1975" },
    { label: "Landing", value: "20 July 1976, 11:53:06 UT" },
    { label: "Site", value: "Chryse Planitia, 22.483° N, 47.94° W" },
    { label: "Last contact", value: "11 November 1982" },
    { label: "Also known as", value: "Thomas Mutch Memorial Station" },
  ],
  sources: VIKING_SOURCES,
};

export const VIKING_2: WikiEntry = {
  lead: "Viking 2 was the second of NASA's twin Viking spacecraft. Its lander touched down on Utopia Planitia on 3 September 1976, about 6,460 km from its twin, and sent data until its batteries failed in April 1980.",
  sections: [
    WHY,
    {
      id: "swap",
      title: "Meant to go first",
      paras: [
        "The spacecraft called Viking-A was scheduled to launch first, but a problem with its batteries meant it launched second, as Viking 2, on 9 September 1975. It entered Mars orbit on 7 August 1976, almost 11 months later.",
      ],
    },
    {
      id: "landing",
      title: "Utopia Planitia",
      paras: [
        "Photos of the first-choice site again showed rough ground, so planners chose Utopia Planitia, near the edge of the polar ice cap, where water was located and there was a better chance of finding signs of life. The lander separated at 20:19 UT on 3 September 1976 and landed at 22:37:50 UT, at 47.968° N, 225.71° W.",
        "The site was rockier and flatter than Viking 1's, and the lander sat tilted 8.5 degrees to the west. With so few landmarks, orbiter images could not pin down exactly where it was.",
      ],
    },
    {
      id: "science",
      title: "The same puzzle",
      paras: [
        "Its biology experiments, using soil scooped on three occasions from 12 September 1976, gave results like its twin's: inconclusive on whether life exists or ever existed on Mars. Scientists thought ultraviolet light had created reactive chemicals in the soil that could mimic signs of living organisms.",
      ],
    },
    {
      id: "end",
      title: "Silence",
      paras: [
        "NASA announced on 16 November 1976 that both Vikings had met their goals, and the landers carried on in extended missions. The Viking 2 orbiter was shut down after a series of leaks on 24 July 1978. The lander kept transmitting until April 1980; NASA Science gives the last date as 12 April, the NSSDCA catalogue as 11 April.",
        "In July 2001 it was renamed the Gerald Soffen Memorial Station, after Viking's project scientist.",
      ],
    },
  ],
  timeline: [
    { date: "9 September 1975", text: "Launch on a Titan IIIE-Centaur." },
    { date: "7 August 1976", text: "Enters orbit around Mars." },
    { date: "3 September 1976", text: "Lands on Utopia Planitia at 22:37:50 UT." },
    { date: "12 September 1976", text: "First of three soil samples for the biology lab." },
    { date: "24 July 1978", text: "Viking 2 orbiter shut down after leaks." },
    { date: "April 1980", text: "The lander's last transmission." },
    { date: "July 2001", text: "Renamed the Gerald Soffen Memorial Station." },
  ],
  facts: [
    { label: "Lander mass", value: "978 kg" },
    { label: "Launch", value: "9 September 1975" },
    { label: "Landing", value: "3 September 1976, 22:37:50 UT" },
    { label: "Site", value: "Utopia Planitia, 47.968° N, 225.71° W" },
    { label: "Tilt", value: "8.5° to the west" },
    { label: "Last contact", value: "11 or 12 April 1980 (sources differ)" },
    { label: "Also known as", value: "Gerald Soffen Memorial Station" },
  ],
  sources: VIKING_SOURCES,
};
