import type { WikiEntry } from "./types";

export const OPPORTUNITY: WikiEntry = {
  lead: "Opportunity was the second of NASA's twin Mars Exploration Rovers. Designed to last 90 Martian days and drive 1 km, it worked for almost 15 years, drove 45.16 km, found evidence that water once soaked its landing site, and fell silent in a planet-wide dust storm in June 2018.",
  sections: [
    {
      id: "why",
      title: "Why it was built",
      paras: [
        "Opportunity and its twin Spirit were sent to opposite sides of Mars to look for clues to past water, at places where conditions may once have been favorable for life. Because liquid water is required for life as we know it, finding evidence of it was the mission's primary objective.",
        "Each rover was about the size of a golf cart, with cameras on a mast about 1.5 m above the ground and a robotic arm that pressed a microscope, two spectrometers, magnets and a rock abrasion tool against rocks and soil. The aluminium cable shield on each rock abrasion tool was made from metal recovered from the World Trade Center towers, as a memorial.",
      ],
    },
    {
      id: "landing",
      title: "A hole in Meridiani",
      paras: [
        "Opportunity launched on a Delta II Heavy from Cape Canaveral on 7 July 2003 and landed on 25 January 2004 (24 January U.S. time). Wrapped in airbags, it bounced at least 26 times and rolled into a small crater called Eagle in Meridiani Planum, 14.9 km from its target. The site was named Challenger Memorial Station after the Space Shuttle crew lost in 1986.",
      ],
    },
    {
      id: "water",
      title: "Evidence of water",
      paras: [
        "At its landing site Opportunity found hematite, a mineral that forms in water, in tiny spheres nicknamed blueberries, along with layered bedrock. It climbed out of Eagle on 22 March 2004 and drove to Endurance crater. In January 2005, near its discarded heat shield, it found a basketball-sized iron-nickel meteorite.",
        "In 2005 a sand ripple trapped it for six weeks. It reached Victoria crater, about 800 m wide, in September 2006, survived severe dust storms in 2007, then explored inside the crater for almost a year.",
      ],
    },
    {
      id: "endeavour",
      title: "Endeavour and the records",
      paras: [
        "On 9 August 2011, after nearly three years and about 21 km, it reached Endeavour crater, 22 km wide. There it found strong signs of ancient water similar to the drinkable water of a pond or lake on Earth. On 20 May 2010 it had already passed Viking 1's record for the longest working life on the Martian surface.",
        "It passed the Apollo 17 lunar rover's 35.744 km in May 2013, logged 40.25 km by July 2014, and on 24 March 2015 passed the length of a marathon, the first human enterprise to go that far on another world. In March 2016 it drove at a tilt of 32 degrees, the steepest slope any Mars rover had driven.",
      ],
    },
    {
      id: "end",
      title: "The storm",
      paras: [
        "In 2017 Opportunity began driving down Perseverance Valley, a gully on Endeavour's western rim. In June 2018 a planet-wide dust storm blanketed its location and cut off the sunlight its solar panels needed. Its final communication arrived on 10 June 2018.",
        "Over eight months engineers sent more than a thousand commands to restore contact. NASA declared the mission complete on 13 February 2019. Opportunity had exceeded its life expectancy 60 times, returned more than 217,000 images, and driven 45.16 km.",
      ],
    },
  ],
  timeline: [
    { date: "7 July 2003", text: "Launch on a Delta II Heavy." },
    { date: "25 January 2004", text: "Lands in Eagle crater, Meridiani Planum." },
    { date: "22 March 2004", text: "Climbs out of Eagle toward Endurance." },
    { date: "26 July 2004", text: "Sol 180: double its planned mission." },
    { date: "20 March 2005", text: "One-day driving record: 220 m." },
    { date: "2005", text: "Six weeks stuck in a sand ripple." },
    { date: "September 2006", text: "Reaches Victoria crater." },
    { date: "20 May 2010", text: "Passes Viking 1's surface-longevity record." },
    { date: "9 August 2011", text: "Arrives at Endeavour crater." },
    { date: "24 March 2015", text: "Passes marathon distance." },
    { date: "10 March 2016", text: "Drives a 32-degree slope." },
    { date: "10 June 2018", text: "Last signal in a planet-wide dust storm." },
    { date: "13 February 2019", text: "Mission declared complete." },
  ],
  facts: [
    { label: "Mission", value: "Mars Exploration Rover B (MER-1)" },
    { label: "Launch", value: "7 July 2003, Delta II 7925H" },
    { label: "Landing", value: "25 January 2004, Meridiani Planum" },
    { label: "Planned", value: "90 Martian days, 1 km" },
    { label: "Distance driven", value: "45.16 km" },
    { label: "Images", value: "More than 217,000" },
    { label: "Last signal", value: "10 June 2018" },
    { label: "Mass", value: "185 kg (NASA Science) or 174 kg (NASA release)" },
  ],
  sources: [
    { label: "NASA Science: Opportunity", url: "https://science.nasa.gov/mission/mer-opportunity/" },
    { label: "NASA release 19-004: Opportunity mission comes to end", url: "https://www.nasa.gov/news-release/nasas-record-setting-opportunity-rover-mission-on-mars-comes-to-end/" },
  ],
};
