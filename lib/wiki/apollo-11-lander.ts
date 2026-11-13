import type { WikiEntry } from "./types";

export const APOLLO_11_LANDER: WikiEntry = {
  lead: "Eagle was the Apollo 11 Lunar Module, built by Grumman, that carried Neil Armstrong and Buzz Aldrin to the first crewed landing on the Moon on 20 July 1969. Its descent stage, with a commemorative plaque on one leg, served as the launch pad for their return and still stands at Tranquility Base.",
  sections: [
    {
      id: "why",
      title: "Why it was built",
      paras: [
        "Apollo 11's primary objective was to complete the national goal President John F. Kennedy set on 25 May 1961: land people on the Moon and return them to Earth. The Lunar Module was the part of the spacecraft built to make the landing; the command module Columbia stayed in lunar orbit with Michael Collins.",
      ],
    },
    {
      id: "spacecraft",
      title: "Two stages",
      paras: [
        "The Lunar Module had a descent stage, with the landing engine, legs and footpads, and an ascent stage, the crew cabin with its own engine. Long rods under the footpads were surface-sensing probes: on contact they signalled the crew to shut down the descent engine.",
      ],
    },
    {
      id: "landing",
      title: "The landing",
      paras: [
        "Apollo 11 launched from Cape Kennedy at 9:32 a.m. EDT on 16 July 1969. On 20 July, Eagle undocked from Columbia and began its powered descent, the engine firing for 756.3 seconds. Near the bottom, Armstrong took partial manual control and steered past an area littered with boulders.",
        "Eagle landed in the Sea of Tranquility at 4:17 p.m. EDT, at 0°41′15″ N, 23°26′ E, about four miles downrange of the planned point and almost a minute and a half early. NASA's account says only 30 seconds of fuel remained. Armstrong radioed: \"Houston, Tranquility Base here. The Eagle has landed.\"",
      ],
    },
    {
      id: "surface",
      title: "21 hours at Tranquility Base",
      paras: [
        "Armstrong stepped onto the Moon at about 109 hours 42 minutes into the mission, and Aldrin followed about 20 minutes later. In a moonwalk of more than two and a half hours they ranged up to 300 feet from Eagle, set up a seismic experiment, a laser reflector and a solar wind experiment, and gathered samples. Aldrin described the view as \"magnificent desolation.\"",
        "They spent 21 hours 36 minutes on the surface in all.",
      ],
    },
    {
      id: "left-behind",
      title: "Left behind",
      paras: [
        "After a rest that included seven hours of sleep, the ascent stage engine fired at 124 hours 22 minutes and burned for 435 seconds, lifting Armstrong and Aldrin off the descent stage and into lunar orbit to dock with Columbia. The ascent stage was later jettisoned and left in lunar orbit.",
        "The descent stage stayed where it landed, with the commemorative plaque signed by President Richard M. Nixon and the three astronauts attached to it. NASA's Lunar Reconnaissance Orbiter has since photographed it at the landing site.",
      ],
    },
  ],
  timeline: [
    { date: "25 May 1961", text: "President Kennedy sets the goal of a crewed lunar landing." },
    { date: "16 July 1969", text: "Apollo 11 launches on a Saturn V, 9:32 a.m. EDT." },
    { date: "19 July 1969", text: "Lunar orbit insertion." },
    { date: "20 July 1969", text: "Eagle lands at 4:17 p.m. EDT; Armstrong and Aldrin walk on the Moon." },
    { date: "21 July 1969", text: "The ascent stage lifts off, leaving the descent stage at Tranquility Base." },
    { date: "24 July 1969", text: "Splashdown in the Pacific Ocean." },
    { date: "2009", text: "The Lunar Reconnaissance Orbiter photographs the landing site." },
  ],
  facts: [
    { label: "Vehicle", value: "Lunar Module LM-5, Eagle" },
    { label: "Built by", value: "Grumman" },
    { label: "Crew landed", value: "Neil Armstrong, Buzz Aldrin" },
    { label: "Landing", value: "20 July 1969, 4:17 p.m. EDT" },
    { label: "Site", value: "Sea of Tranquility, 0°41′ N, 23°26′ E" },
    { label: "Time on the surface", value: "21 h 36 min" },
    { label: "Left on the Moon", value: "Descent stage and plaque" },
  ],
  sources: [
    { label: "NASA: Apollo 11 mission overview", url: "https://www.nasa.gov/history/apollo-11-mission-overview/" },
    { label: "NASA History: July 20, 1969, One Giant Leap for Mankind", url: "https://www.nasa.gov/history/july-20-1969-one-giant-leap-for-mankind/" },
    { label: "NASA: The Eagle Prepares to Land", url: "https://www.nasa.gov/image-article/eagle-prepares-land/" },
    { label: "NASA: Apollo 11", url: "https://www.nasa.gov/mission/apollo-11/" },
  ],
};
