import type { WikiEntry } from "./types";

export const SPIRIT: WikiEntry = {
  lead: "Spirit was the first of NASA's twin Mars Exploration Rovers. It landed in Gusev crater in January 2004 to look for signs of past water, worked for six years, two months and 19 days, more than 25 times its planned lifetime, and fell silent in March 2010 after getting stuck in soft soil.",
  sections: [
    {
      id: "why",
      title: "Why it was built",
      paras: [
        "Spirit and Opportunity were sent to opposite sides of Mars, to places suspected of having been affected by liquid water, to study rocks and soil for clues to past water and to sites where conditions may once have been favorable to life.",
        "Each rover was about the size of a golf cart and about 185 kg, seven times heavier than Sojourner, with cameras on a mast about 1.5 m above the ground for 360-degree stereo views and a robotic arm carrying a Mössbauer spectrometer, an alpha particle X-ray spectrometer, magnets, a microscopic imager and a rock abrasion tool.",
      ],
    },
    {
      id: "landing",
      title: "Twenty-eight bounces",
      paras: [
        "Spirit launched from Cape Canaveral on 10 June 2003. On 3 January 2004 (U.S. time) its lander dropped by parachute, fired retrorockets inside four airbags, hit the ground at about 14 m/s and bounced 28 times before rolling to a stop in Gusev crater, about 13.4 km from its target.",
        "The site was named Columbia Memorial Station in honour of the seven astronauts lost on the space shuttle Columbia in February 2003.",
      ],
    },
    {
      id: "early",
      title: "A scare, then a first",
      paras: [
        "On 21 January 2004 NASA lost contact when a problem in Spirit's flash memory put it into a fault mode. Controllers reformatted the memory and sent a software patch, and normal operations resumed on 5 February. The next day Spirit ground into a rock called Adirondack with its rock abrasion tool, the first time this was done on Mars.",
        "The mission was planned for 90 Martian days, until about 4 April 2004, but was extended again and again.",
      ],
    },
    {
      id: "hills",
      title: "Up Husband Hill",
      paras: [
        "Spirit visited Bonneville crater, about 370 m from the landing site, then spent a long time at the Columbia Hills. In March 2005 passing dust devils swept dust off its solar panels and its power rose from the usual 60% to 93%, and on 29 September 2005 it reached the summit of Husband Hill and took 360-degree panoramas of Gusev crater.",
        "In 2006 a front wheel stopped working. Dragging it turned out to be useful: the dead wheel scraped away the top layer of soil and exposed bright, nearly pure silica, strong evidence of a wetter past, likely from hot springs or steam vents. At Home Plate it found evidence of an ancient explosion, and at a place named Tyrone, soil rich in sulfur with a trace of water.",
      ],
    },
    {
      id: "end",
      title: "Stuck at Troy",
      paras: [
        "At the end of 2008 a winter storm cut its solar power to about 89 watt-hours per Martian day, against about 700 normally; it recovered to about 372 by April 2009. On 1 May 2009, driving beside Home Plate, Spirit became stuck in soft soil. On 28 November its right rear wheel stopped working too.",
        "By late January 2010 NASA turned Spirit into a stationary science platform. It needed to tilt its panels toward the winter Sun in the northern sky, but could not. After 22 March 2010 JPL could not regain contact. Despite more than 1,300 commands, NASA ended recovery efforts on 25 May 2011. The most likely cause was cold so severe that its survival heaters stopped being effective. It had driven about 7.73 km.",
      ],
    },
  ],
  timeline: [
    { date: "10 June 2003", text: "Launch from Cape Canaveral." },
    { date: "3–4 January 2004", text: "Airbag landing in Gusev crater (3 January U.S. time)." },
    { date: "21 January 2004", text: "Flash memory fault; recovered by 5 February." },
    { date: "6 February 2004", text: "First rock grinding on Mars, at Adirondack." },
    { date: "29 September 2005", text: "Reaches the summit of Husband Hill." },
    { date: "2006", text: "A front wheel stops; dragging it uncovers silica." },
    { date: "1 May 2009", text: "Stuck in soft soil at Troy." },
    { date: "January 2010", text: "Becomes a stationary science platform." },
    { date: "22 March 2010", text: "Last contact." },
    { date: "25 May 2011", text: "NASA ends recovery efforts." },
  ],
  facts: [
    { label: "Mission", value: "Mars Exploration Rover A (MER-2)" },
    { label: "Mass", value: "About 185 kg" },
    { label: "Launch", value: "10 June 2003" },
    { label: "Landing", value: "January 2004, Gusev crater" },
    { label: "Site", value: "14.5692° S, 175.4729° E" },
    { label: "Distance driven", value: "About 7.73 km" },
    { label: "Worked for", value: "6 years, 2 months, 19 days" },
    { label: "Last contact", value: "22 March 2010" },
  ],
  sources: [
    { label: "NASA Science: Spirit", url: "https://science.nasa.gov/mission/mer-spirit/" },
    { label: "NASA: NASA Celebrates Decade of Mars Exploration by Spirit, Opportunity", url: "https://www.nasa.gov/missions/mer/nasa-celebrates-decade-of-mars-exploration-by-spirit-opportunity/" },
  ],
};
