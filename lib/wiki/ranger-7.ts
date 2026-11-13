import type { WikiEntry } from "./types";

export const RANGER_7: WikiEntry = {
  lead: "Ranger 7 was a NASA spacecraft built to photograph the Moon up close and then crash into it. On 31 July 1964 it sent back the first close-up pictures of the lunar surface taken by an American spacecraft, ending a run of 13 failed U.S. Moon attempts.",
  sections: [
    {
      id: "why",
      title: "Why it was built",
      paras: [
        "Until 1964 no close-up photographs of the Moon's surface existed, only views through Earth-based telescopes and grainy far-side images from the Soviet Luna 3 in 1959. Most scientists believed the surface was solid enough for astronauts and their landing craft, but some thought a deep layer of dust might swallow any visitor.",
        "The Ranger program, begun in 1960 and managed by NASA's Jet Propulsion Laboratory, set out to take the first high-resolution close-up images of the Moon before Apollo.",
      ],
    },
    {
      id: "failures",
      title: "Six Rangers before it",
      paras: [
        "Ranger was planned in three \"blocks\" of increasing difficulty. The two Block I spacecraft (1961) were meant only to test the Atlas-Agena rocket and the spacecraft in Earth orbit; neither left low Earth orbit because of booster problems.",
        "Block II (1962) carried a TV camera, a gamma-ray spectrometer, a radar altimeter and a seismometer in a capsule cushioned in balsa wood. Ranger 3 missed the Moon by 22,000 miles. Ranger 4 became the first American spacecraft to hit the Moon, on its far side, but a power failure meant it returned no data. Ranger 5 missed by 450 miles. Ranger 6, the first Block III craft, struck the Moon in January 1964, but its television system failed and returned no pictures.",
      ],
    },
    {
      id: "spacecraft",
      title: "The spacecraft",
      paras: [
        "Block III Rangers carried a television instrument with six cameras, designed to show more and more detail as the spacecraft fell toward the Moon. Much of the technology now taken for granted was untested before Ranger: three-axis stabilisation so the solar panels could face the Sun, the antenna point at Earth and the cameras point at the target; rocket propulsion carried on the spacecraft for accurate targeting; and two-way communication with on-board sequencing.",
      ],
    },
    {
      id: "last-minutes",
      title: "The last 17 minutes",
      paras: [
        "Ranger 7 launched from Cape Canaveral on 28 July 1964. The Atlas-Agena first placed it in Earth orbit, then sent it toward the Moon. A course correction followed the next day, and on 31 July Ranger 7 arrived precisely on target.",
        "This time the cameras switched on as planned. During its final 17 minutes it sent pictures to NASA's Goldstone antenna in California. The first, from an altitude of 1,311 miles, showed the 67-mile-wide crater Alphonsus. The last, taken 2.3 seconds before impact at 1.62 miles per second from about 1,600 feet up, could show detail as small as 15 inches.",
        "It hit the northern rim of the Sea of Clouds at 10°38′ S, 20°36′ W. The area was renamed Mare Cognitum, the Known Sea.",
      ],
    },
    {
      id: "results",
      title: "What it showed",
      paras: [
        "Many images were a thousand times sharper than photographs taken from Earth. They showed that impact craters dominate the surface even on smooth-looking plains, down to pockmarks about 50 cm across, and that the bright rays around craters such as Copernicus are chains of small craters and debris. Scientists concluded that crewed Apollo landings would be possible on the relatively smooth maria.",
      ],
    },
    {
      id: "legacy",
      title: "Legacy",
      paras: [
        "Two more Rangers followed. Ranger 8 returned more than 7,000 images and crashed in Mare Tranquillitatis, where Apollo 11 would land four and a half years later. Ranger 9's images of Alphonsus were broadcast live as it approached. Together they gave scientists the confidence to move on to the Surveyor soft landers.",
        "Ranger 7's impact crater was photographed by the Apollo 16 crew in 1972 and by NASA's Lunar Reconnaissance Orbiter in 2010.",
      ],
    },
  ],
  timeline: [
    { date: "1960", text: "Ranger program begins, managed by JPL." },
    { date: "1961", text: "Block I: Rangers 1 and 2 fail to leave low Earth orbit." },
    { date: "1962", text: "Block II: Ranger 3 misses the Moon, Ranger 4 hits its far side without returning data, Ranger 5 misses." },
    { date: "January 1964", text: "Ranger 6 reaches the Moon but its cameras fail." },
    { date: "28 July 1964", text: "Ranger 7 launches from Cape Canaveral on an Atlas-Agena." },
    { date: "29 July 1964", text: "Mid-course correction." },
    { date: "31 July 1964", text: "Cameras switch on about 17 minutes before impact; the last picture comes 2.3 seconds before it hits Mare Cognitum." },
    { date: "1972", text: "Apollo 16 photographs Ranger 7's crater." },
    { date: "2010", text: "The Lunar Reconnaissance Orbiter images the crater at a low Sun angle." },
  ],
  facts: [
    { label: "Program", value: "Ranger, Block III" },
    { label: "Managed by", value: "NASA Jet Propulsion Laboratory" },
    { label: "Launch", value: "28 July 1964, Cape Canaveral" },
    { label: "Rocket", value: "Atlas-Agena" },
    { label: "Impact", value: "31 July 1964" },
    { label: "Impact site", value: "Mare Cognitum, 10°38′ S, 20°36′ W" },
    { label: "Pictures", value: "4,308 (NSSDCA) or 4,316 (NASA Science)" },
    { label: "Cameras", value: "6 TV cameras" },
  ],
  sources: [
    { label: "NASA Science: Ranger 7", url: "https://science.nasa.gov/mission/ranger-7/" },
    { label: "NASA History: 60 Years Ago, Ranger 7 Photographs the Moon", url: "https://www.nasa.gov/history/60-years-ago-ranger-7-photographs-the-moon/" },
    { label: "NASA Science: Lunar Ranger and Surveyor Programs", url: "https://science.nasa.gov/mission/lunar-rangers-and-surveyors/" },
  ],
};
