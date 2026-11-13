/**
 * The archive. Facts only: every date and number here must trace to a source in `sources`.
 * Images in /public/images are AI-made placeholders (see scripts/generate-assets.mjs) and
 * should be replaced with credited NASA public-domain photos before launch.
 */

export type Body = "mars" | "moon";
export type Category = "rover" | "lander" | "helicopter" | "impactor" | "lost";

/** How the signal ended; picks the last-signal art on the profile. */
export type LostHow = "impact" | "dust" | "winter" | "power" | "command" | "lost" | "left" | "night" | "grounded";

export type Chapter = { title: string; year: string; text: string; image: string };

export type Hero = {
  slug: string;
  no: number;
  name: string;
  nickname?: string;
  designation: string;
  kind: string;
  category: Category;
  body: Body;
  builder: string;
  summary: string;
  image: string;
  /** Transparent studio cut-out for exhibit cards (public/images/card-*.webp), when one exists. */
  card?: string;
  launch: { date: string; time?: string; rocket: string; pad: string };
  landing?: { date: string; site: string; method: string };
  end: { date: string; label: string; story: string; how: LostHow };
  restingPlace: string;
  coords: { lat: number; lon: number; approx?: boolean };
  stats: { value: string; label: string; icon: "route" | "timer" | "calendar" | "spark" }[];
  specs?: { label: string; value: string }[];
  parts?: { label: string; x: number; y: number; side: "left" | "right" }[];
  chapters?: Chapter[];
  story?: Chapter[];
  discoveries?: { title: string; image: string }[];
  route?: { km: string; points: { name: string; x: number; y: number }[] };
  gallery: string[];
  twin?: string;
  sources: { label: string; url: string }[];
  /** Real archive portrait (`nasa/<id>`); falls back to the AI placeholder `image`. */
  photo?: string;
  /** Real archive photos for the profile sections. */
  photos?: { born?: string; launch?: string; landing?: string; end?: string };
  /** A public NASA 3D model of this machine, served from /public/models. */
  model?: { src: string; title: string; source: string; note?: string };
  /** Where to explore further: mission pages, catalogues, image archives. */
  links?: { label: string; url: string }[];
};

const NSSDCA = (id: string) => `https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=${id}`;
/** A credited photo from the NASA Image and Video Library (see lib/photos.ts). */
const N = (id: string) => `nasa/${id}`;
const SCI = (path: string) => `https://science.nasa.gov/mission/${path}/`;
const LIB = (q: string) => `https://images.nasa.gov/search?q=${encodeURIComponent(q)}`;
const NASA3D = (folder: string) => `https://github.com/nasa/NASA-3D-Resources/tree/master/3D%20Models/${encodeURIComponent(folder)}`;
const PJ = (id: string) => `https://photojournal.jpl.nasa.gov/catalog/${id}`;

export const HEROES: Hero[] = [
  {
    slug: "ranger-7",
    no: 1,
    name: "Ranger 7",
    designation: "Ranger Block III lunar impactor",
    kind: "Impactor",
    category: "impactor",
    body: "moon",
    builder: "JPL",
    summary:
      "The first American spacecraft to send back close-up pictures of the Moon. It took 4,308 photographs in its last 17 minutes before striking the surface on purpose.",
    image: "ranger",
    card: "card-ranger",
    photo: N("PIA23520"),
    photos: { born: N("PIA23520"), end: N("PIA02975") },
    launch: { date: "1964-07-28", rocket: "Atlas LV-3 Agena-B", pad: "Launch Complex 12" },
    end: {
      date: "1964-07-31",
      how: "impact",
      label: "Impact",
      story: "Ranger 7 kept its cameras running all the way down and hit the Moon in the region later named Mare Cognitum, the Known Sea.",
    },
    restingPlace: "Mare Cognitum, Moon",
    coords: { lat: -10.6, lon: -20.7 },
    stats: [
      { value: "4,308", label: "photos sent", icon: "spark" },
      { value: "3 days", label: "Earth to Moon", icon: "timer" },
      { value: "1964", label: "first US close-ups", icon: "calendar" },
    ],
    specs: [
      { label: "Builder", value: "JPL" },
      { label: "Mass", value: "365.6 kg" },
      { label: "Cameras", value: "6 TV cameras" },
      { label: "Rocket", value: "Atlas-Agena B" },
    ],
    chapters: [
      { title: "The first success", year: "1964", text: "After 13 failures in a row, Ranger 7 was the first clear U.S. success at the Moon.", image: N("PIA23520") },
      { title: "First close-up", year: "31 July 1964", text: "Its first picture, taken about 17 minutes before impact, was the first image of the Moon from a U.S. spacecraft.", image: N("PIA02975") },
      { title: "Guericke crater", year: "31 July 1964", text: "Frame after frame closed in on the surface as it fell, including this view of Guericke crater.", image: N("PIA02974") },
      { title: "The last picture", year: "31 July 1964", text: "The last image reached Earth 2.3 seconds before impact, at 13:25:49 UT.", image: N("PIA02975") },
    ],
    links: [
      { label: "NASA Science: Ranger 7", url: SCI("ranger-7") },
      { label: "NSSDCA catalogue entry", url: NSSDCA("1964-041A") },
      { label: "Ranger 7 photos in the NASA Image Library", url: LIB("Ranger 7") },
    ],
    gallery: [N("PIA23520"), N("PIA02975"), N("PIA02974")],
    sources: [
      { label: "NSSDCA: Ranger 7", url: NSSDCA("1964-041A") },
      { label: "NASA Science: Ranger 7", url: SCI("ranger-7") },
      { label: "Photojournal: PIA02975", url: PJ("PIA02975") },
    ],
  },
  {
    slug: "surveyor-1",
    no: 2,
    name: "Surveyor 1",
    designation: "Surveyor lunar lander",
    kind: "Lander",
    category: "lander",
    body: "moon",
    builder: "Hughes Aircraft",
    summary:
      "The first American spacecraft to soft-land on the Moon. It proved the ground could hold a lander, three years before Apollo 11.",
    image: "surveyor",
    card: "card-surveyor",
    photo: N("PIA12910"),
    photos: { landing: N("PIA02976"), end: N("PIA12910") },
    launch: { date: "1966-05-30", rocket: "Atlas-Centaur", pad: "Launch Complex 36A" },
    landing: { date: "1966-06-02", site: "Oceanus Procellarum", method: "Retro-rocket soft landing" },
    end: {
      date: "1967-01-07",
      how: "night",
      label: "Last signal",
      story: "Surveyor 1 survived the long lunar nights and answered Earth on and off for seven months before its final contact in January 1967.",
    },
    restingPlace: "Oceanus Procellarum, Moon",
    coords: { lat: -2.47, lon: -43.34 },
    stats: [
      { value: "11,000+", label: "photos sent", icon: "spark" },
      { value: "7 months", label: "of contact", icon: "timer" },
      { value: "1966", label: "first US soft landing", icon: "calendar" },
    ],
    specs: [
      { label: "Builder", value: "Hughes Aircraft" },
      { label: "Launch mass", value: "995.2 kg" },
      { label: "Mass on landing", value: "294.3 kg" },
      { label: "Height", value: "About 3 m" },
      { label: "Camera", value: "1 TV camera" },
    ],
    chapters: [
      { title: "Seven landers", year: "1961", text: "NASA picked Hughes Aircraft to build seven Surveyor landers under JPL's technical direction.", image: N("PIA02976") },
      { title: "First try", year: "2 June 1966", text: "It touched down in the Ocean of Storms 63.6 hours after launch, about 14 km from its target.", image: N("PIA02976") },
      { title: "11,240 pictures", year: "1966", text: "By 6 July 1966 it had sent back 11,240 pictures over two sessions.", image: N("PIA02976") },
      { title: "Seen again", year: "2009", text: "NASA's Lunar Reconnaissance Orbiter photographed Surveyor 1, still sitting on Oceanus Procellarum.", image: N("PIA12910") },
    ],
    links: [
      { label: "NASA Science: Surveyor 1", url: SCI("surveyor-1") },
      { label: "NSSDCA catalogue entry", url: NSSDCA("1966-045A") },
      { label: "Surveyor 1 seen from lunar orbit (LRO)", url: PJ("PIA12910") },
    ],
    gallery: [N("PIA12910"), N("PIA02976")],
    sources: [
      { label: "NSSDCA: Surveyor 1", url: NSSDCA("1966-045A") },
      { label: "NASA Science: Surveyor 1", url: SCI("surveyor-1") },
      { label: "Photojournal: PIA12910", url: PJ("PIA12910") },
    ],
  },
  {
    slug: "apollo-11-lander",
    no: 3,
    name: "Apollo 11 lander",
    nickname: "Eagle",
    designation: "Lunar Module LM-5, descent stage",
    kind: "Lander",
    category: "lander",
    body: "moon",
    builder: "Grumman",
    summary:
      "The descent stage of the Lunar Module Eagle carried the first people to land on the Moon. It stayed behind as the launch pad for their trip home and still stands at Tranquility Base.",
    image: "apollo",
    card: "card-apollo",
    photo: N("as11-40-5927"),
    photos: { born: N("jsc2007e034221"), launch: N("S69-39961"), landing: N("as11-40-5902"), end: N("as11-44-6642") },
    launch: { date: "1969-07-16", time: "09:32 EDT", rocket: "Saturn V", pad: "Launch Complex 39A" },
    landing: { date: "1969-07-20", site: "Mare Tranquillitatis", method: "Crewed powered descent" },
    end: {
      date: "1969-07-21",
      how: "left",
      label: "Left behind",
      story: "On 21 July 1969 the ascent stage lifted off from the descent stage and left it at Tranquility Base, with a plaque on one leg.",
    },
    restingPlace: "Tranquility Base, Moon",
    coords: { lat: 0.67, lon: 23.47 },
    stats: [
      { value: "21 h 36 m", label: "on the surface", icon: "timer" },
      { value: "2", label: "astronauts landed", icon: "spark" },
      { value: "1969", label: "first crewed landing", icon: "calendar" },
    ],
    specs: [
      { label: "Builder", value: "Grumman" },
      { label: "Vehicle", value: "Lunar Module LM-5" },
      { label: "Crew landed", value: "Neil Armstrong, Buzz Aldrin" },
      { label: "Left on the Moon", value: "Descent stage and plaque" },
    ],
    chapters: [
      { title: "Countdown test", year: "July 1969", text: "The Apollo 11 spacecraft sat on its Saturn V as the service tower rolled back during a countdown demonstration test.", image: N("jsc2007e034221") },
      { title: "Tranquility Base", year: "20 July 1969", text: "Eagle touched down on the Sea of Tranquility. Neil Armstrong photographed Buzz Aldrin beside it with a 70 mm camera.", image: N("as11-40-5927") },
      { title: "The plaque", year: "20 July 1969", text: "A plaque on the ladder of the landing-gear strut was covered with a thin steel sheet in flight. It stayed on the descent stage.", image: N("as11-40-5899") },
      { title: "Liftoff", year: "21 July 1969", text: "The ascent stage carried Armstrong and Aldrin back to Michael Collins in lunar orbit. The descent stage was their launch pad.", image: N("as11-44-6642") },
      { title: "Seen from orbit", year: "2009", text: "NASA's Lunar Reconnaissance Orbiter photographed the landing site, where Eagle's descent stage is visible.", image: N("PIA12909") },
    ],
    model: { src: "/models/apollo-lunar-module.glb", title: "Apollo Lunar Module", source: NASA3D("Apollo Lunar Module"), note: "The full Lunar Module. Its descent stage is the part that stayed at Tranquility Base." },
    links: [
      { label: "NASA: Apollo 11", url: "https://www.nasa.gov/mission/apollo-11/" },
      { label: "Apollo Lunar Surface Journal", url: "https://www.nasa.gov/history/alsj/" },
      { label: "Apollo 11 photos in the NASA Image Library", url: LIB("Apollo 11 lunar module") },
      { label: "Download the 3D model (NASA 3D Resources)", url: NASA3D("Apollo Lunar Module") },
    ],
    gallery: [N("as11-40-5927"), N("as11-40-5902"), N("as11-40-5899"), N("S69-39961"), N("as11-44-6642"), N("PIA12909"), N("jsc2007e034221")],
    sources: [
      { label: "NSSDCA: Apollo 11 Lunar Module", url: NSSDCA("1969-059C") },
      { label: "NASA: Apollo 11", url: "https://www.nasa.gov/mission/apollo-11/" },
      { label: "NASA Image Library: AS11-40-5899 (plaque)", url: "https://images.nasa.gov/details/as11-40-5899" },
      { label: "NASA Image Library: AS11-44-6642 (ascent stage)", url: "https://images.nasa.gov/details/as11-44-6642" },
    ],
  },
  {
    slug: "apollo-15-rover",
    no: 4,
    name: "Lunar Roving Vehicle",
    nickname: "LRV-1",
    designation: "Apollo 15 Lunar Roving Vehicle",
    kind: "Rover",
    category: "rover",
    body: "moon",
    builder: "Boeing",
    summary:
      "The first car driven on the Moon. Apollo 15's rover let astronauts travel far beyond the lander, to the edge of Hadley Rille.",
    image: "lrv",
    card: "card-lrv",
    photo: N("as15-88-11901"),
    photos: { born: N("S71-39867"), launch: N("KSC-71PC-0685"), landing: N("as15-086-11601"), end: N("S71-41509") },
    launch: { date: "1971-07-26", rocket: "Saturn V", pad: "Launch Complex 39A" },
    landing: { date: "1971-07-30", site: "Hadley–Apennine", method: "Folded on the Lunar Module" },
    end: {
      date: "1971-08-02",
      how: "left",
      label: "Last signal",
      story: "Parked away from the lander, the rover's TV camera broadcast the crew's liftoff to Earth, then stayed behind.",
    },
    restingPlace: "Hadley–Apennine, Moon",
    coords: { lat: 26.13, lon: 3.63 },
    stats: [
      { value: "28 km", label: "driven", icon: "route" },
      { value: "3", label: "moonwalks", icon: "spark" },
      { value: "1971", label: "first car on the Moon", icon: "calendar" },
    ],
    specs: [
      { label: "Builder", value: "Boeing" },
      { label: "Drivers", value: "David Scott, James Irwin" },
      { label: "Carried by", value: "Lunar Module Falcon" },
      { label: "Mission", value: "First Apollo landing with a rover" },
    ],
    chapters: [
      { title: "Rehearsal", year: "June 1971", text: "David Scott and James Irwin practised with the rover at Kennedy Space Center before flight.", image: N("S71-39867") },
      { title: "Liftoff", year: "26 July 1971", text: "Apollo 15's Saturn V lifted off from Pad 39A at 9:34 a.m. EDT.", image: N("KSC-71PC-0685") },
      { title: "First drive", year: "31 July 1971", text: "On the first moonwalk Irwin worked at the rover, with the lunar module Falcon close by and Mount Hadley behind.", image: N("as15-86-11603") },
      { title: "Alone at Hadley", year: "1971", text: "Photographed on its own during the third moonwalk, looking north toward Mount Hadley.", image: N("as15-88-11901") },
      { title: "Watching them leave", year: "2 August 1971", text: "The colour TV camera on the parked rover showed Mission Control the liftoff of Falcon's ascent stage.", image: N("S71-41509") },
    ],
    links: [
      { label: "NASA: Apollo 15", url: "https://www.nasa.gov/mission/apollo-15/" },
      { label: "Apollo Lunar Surface Journal", url: "https://www.nasa.gov/history/alsj/" },
      { label: "Apollo 15 rover photos in the NASA Image Library", url: LIB("Apollo 15 Lunar Roving Vehicle") },
    ],
    gallery: [N("as15-88-11901"), N("as15-86-11603"), N("as15-086-11601"), N("S71-41509"), N("KSC-71PC-0685"), N("S71-39867")],
    sources: [
      { label: "NSSDCA: Apollo 15", url: NSSDCA("1971-063C") },
      { label: "NASA: Apollo 15", url: "https://www.nasa.gov/mission/apollo-15/" },
      { label: "NASA Image Library: S71-41509 (liftoff on the rover's TV)", url: "https://images.nasa.gov/details/S71-41509" },
    ],
  },
  {
    slug: "viking-1",
    no: 5,
    name: "Viking 1",
    designation: "Viking 1 lander",
    kind: "Lander",
    category: "lander",
    body: "mars",
    builder: "Martin Marietta",
    summary:
      "The first American spacecraft to land on Mars and work there. It sent back the first pictures from the surface and searched the soil for signs of life.",
    image: "viking-1",
    card: "card-viking-1",
    photo: N("PIA00563"),
    photos: { born: N("101-KSC-75P-12"), launch: N("9141929"), landing: N("PIA00381"), end: N("PIA00567") },
    launch: { date: "1975-08-20", rocket: "Titan IIIE-Centaur", pad: "Launch Complex 41" },
    landing: { date: "1976-07-20", site: "Chryse Planitia", method: "Parachute and retro-rockets" },
    end: {
      date: "1982-11-11",
      how: "command",
      label: "Last signal",
      story: "After more than six years on Mars, a faulty command sent from Earth cut the link. Viking 1 was never heard from again.",
    },
    restingPlace: "Chryse Planitia, Mars",
    coords: { lat: 22.27, lon: -47.95 },
    stats: [
      { value: "2,245", label: "sols on Mars", icon: "timer" },
      { value: "6+ years", label: "on Mars", icon: "calendar" },
      { value: "1976", label: "first US Mars landing", icon: "spark" },
    ],
    specs: [
      { label: "Builder", value: "Martin Marietta" },
      { label: "Lander mass", value: "978 kg" },
      { label: "Power", value: "2 SNAP-19 RTGs" },
      { label: "Cameras", value: "2 facsimile cameras" },
      { label: "Science", value: "Biology lab, GCMS, seismometer, weather station, sampler arm" },
    ],
    chapters: [
      { title: "Sealed for the trip", year: "1975", text: "At Kennedy Space Center, technicians prepared Viking Lander 1's aeroshell cover.", image: N("101-KSC-75P-12") },
      { title: "Liftoff", year: "20 August 1975", text: "A Titan III-Centaur launched Viking 1 from Launch Complex 41.", image: N("9141929") },
      { title: "First picture", year: "20 July 1976", text: "Minutes after landing it took the first photograph ever made on the surface of Mars.", image: N("PIA00381") },
      { title: "In colour", year: "1976", text: "The first colour image from the lander showed the rocky orange plain of Chryse Planitia.", image: N("PIA00563") },
      { title: "Looking for life", year: "28 July 1976", text: "Its robot arm scooped the first soil samples into the biology laboratory. The results were inconclusive.", image: N("PIA00567") },
      { title: "Seen from orbit", year: "2006", text: "The lander, renamed the Thomas Mutch Memorial Station in 1982, was imaged from orbit by HiRISE.", image: N("PIA01881") },
    ],
    model: { src: "/models/viking-lander.glb", title: "Viking Lander", source: NASA3D("Viking Lander"), note: "Viking 1 and Viking 2 landed identical landers." },
    links: [
      { label: "NASA Science: Viking 1", url: SCI("viking-1") },
      { label: "NSSDCA catalogue entry", url: NSSDCA("1975-075C") },
      { label: "Viking 1 photos in the NASA Image Library", url: LIB("Viking Lander 1") },
      { label: "Download the 3D model (NASA 3D Resources)", url: NASA3D("Viking Lander") },
    ],
    gallery: [N("PIA00563"), N("PIA00381"), N("PIA00567"), N("PIA01881"), N("9141929"), N("101-KSC-75P-12")],
    twin: "viking-2",
    sources: [
      { label: "NSSDCA: Viking 1 Lander", url: NSSDCA("1975-075C") },
      { label: "NASA Science: Viking 1", url: SCI("viking-1") },
      { label: "Photojournal: PIA00381", url: PJ("PIA00381") },
    ],
  },
  {
    slug: "viking-2",
    no: 6,
    name: "Viking 2",
    designation: "Viking 2 lander",
    kind: "Lander",
    category: "lander",
    body: "mars",
    builder: "Martin Marietta",
    summary:
      "Viking 1's twin landed on the far side of Mars, on the plains of Utopia Planitia, and photographed frost on the ground in winter.",
    image: "viking-2",
    card: "card-viking-2",
    photo: N("PIA00568"),
    photos: { born: N("101-KSC-75P-110"), launch: N("101-KSC-75PC-167"), landing: N("PIA00396"), end: N("PIA01882") },
    launch: { date: "1975-09-09", rocket: "Titan IIIE-Centaur", pad: "Launch Complex 41" },
    landing: { date: "1976-09-03", site: "Utopia Planitia", method: "Parachute and retro-rockets" },
    end: {
      date: "1980-04-11",
      how: "power",
      label: "Last signal",
      story: "Its batteries failed in April 1980 and Viking 2 fell silent.",
    },
    restingPlace: "Utopia Planitia, Mars",
    coords: { lat: 47.64, lon: 134.29 },
    stats: [
      { value: "1,281", label: "sols on Mars", icon: "timer" },
      { value: "3+ years", label: "on Mars", icon: "calendar" },
      { value: "Frost", label: "seen on Mars", icon: "spark" },
    ],
    specs: [
      { label: "Builder", value: "Martin Marietta" },
      { label: "Lander mass", value: "978 kg" },
      { label: "Power", value: "2 SNAP-19 RTGs" },
      { label: "Landing tilt", value: "8.5° to the west" },
    ],
    chapters: [
      { title: "Viking A", year: "1975", text: "Built to launch first, it was swapped because of a battery problem and flew second, as Viking 2.", image: N("101-KSC-75PC-167") },
      { title: "Utopia Planitia", year: "3 September 1976", text: "It landed about 6,460 km from Viking 1, on a rockier and flatter plain, tilted 8.5 degrees.", image: N("PIA00396") },
      { title: "A different Mars", year: "1976", text: "Its first colour picture showed a field of rocks stretching to a flat horizon.", image: N("PIA00568") },
      { title: "Gerald Soffen Memorial Station", year: "2001", text: "The lander was renamed for Viking's project scientist. It was later imaged from orbit by HiRISE.", image: N("PIA01882") },
    ],
    model: { src: "/models/viking-lander.glb", title: "Viking Lander", source: NASA3D("Viking Lander"), note: "Viking 1 and Viking 2 landed identical landers." },
    links: [
      { label: "NASA Science: Viking 2", url: SCI("viking-2") },
      { label: "NSSDCA catalogue entry", url: NSSDCA("1975-083C") },
      { label: "Viking 2 photos in the NASA Image Library", url: LIB("Viking Lander 2") },
      { label: "Download the 3D model (NASA 3D Resources)", url: NASA3D("Viking Lander") },
    ],
    gallery: [N("PIA00568"), N("PIA00396"), N("PIA09509"), N("PIA01882"), N("101-KSC-75PC-167"), N("101-KSC-75P-110")],
    twin: "viking-1",
    sources: [
      { label: "NSSDCA: Viking 2 Lander", url: NSSDCA("1975-083C") },
      { label: "NASA Science: Viking 2", url: SCI("viking-2") },
    ],
  },
  {
    slug: "pathfinder-sojourner",
    no: 7,
    name: "Pathfinder & Sojourner",
    nickname: "Carl Sagan Memorial Station",
    designation: "Mars Pathfinder lander and Sojourner rover",
    kind: "Lander + rover",
    category: "rover",
    body: "mars",
    builder: "JPL",
    summary:
      "Pathfinder bounced to a stop on airbags and released Sojourner, the first wheeled rover to drive on another planet.",
    image: "pathfinder",
    card: "card-pathfinder",
    photo: N("PIA01122"),
    photos: { born: N("KSC-96PC-1130"), launch: N("9614653"), landing: N("PIA00621"), end: N("PIA00609") },
    launch: { date: "1996-12-04", rocket: "Delta II 7925", pad: "Space Launch Complex 17B" },
    landing: { date: "1997-07-04", site: "Ares Vallis", method: "Airbag landing" },
    end: {
      date: "1997-09-27",
      how: "power",
      label: "Last signal",
      story: "The lander's last full transmission came on 27 September 1997. Sojourner, which talked to Earth through the lander, went quiet with it.",
    },
    restingPlace: "Ares Vallis, Mars",
    coords: { lat: 19.13, lon: -33.22 },
    stats: [
      { value: "83", label: "sols of contact", icon: "timer" },
      { value: "10.6 kg", label: "rover mass", icon: "spark" },
      { value: "1997", label: "first rover on Mars", icon: "calendar" },
    ],
    specs: [
      { label: "Builder", value: "JPL" },
      { label: "Rover mass", value: "10.6 kg" },
      { label: "Rover height", value: "30 cm" },
      { label: "Rocket", value: "Delta II 7925" },
      { label: "Images returned", value: "16,500+ lander, 550 rover" },
    ],
    chapters: [
      { title: "Liftoff", year: "4 December 1996", text: "A Delta II launched Mars Pathfinder from Launch Complex 17B.", image: N("9614653") },
      { title: "Bouncing in", year: "4 July 1997", text: "Wrapped in airbags, it bounced about 15 times, as high as 15 m, before rolling to a stop.", image: N("PIA00621") },
      { title: "Sojourner rolls off", year: "5 July 1997", text: "Late on its second day, Sojourner stood up to its full 30 cm and drove down the lander's rear ramp.", image: N("PIA01122") },
      { title: "Ares Vallis", year: "1997", text: "An ancient flood plain, among the rockiest places on Mars, chosen for its variety of rocks.", image: N("PIA00609") },
    ],
    links: [
      { label: "NASA Science: Mars Pathfinder", url: SCI("mars-pathfinder") },
      { label: "NSSDCA catalogue entry", url: NSSDCA("1996-068A") },
      { label: "Pathfinder and Sojourner photos in the NASA Image Library", url: LIB("Sojourner rover") },
    ],
    gallery: [N("PIA01122"), N("PIA00621"), N("PIA00609"), N("9614653"), N("KSC-96PC-1130"), N("PIA04422")],
    sources: [
      { label: "NSSDCA: Mars Pathfinder", url: NSSDCA("1996-068A") },
      { label: "NASA Science: Mars Pathfinder", url: SCI("mars-pathfinder") },
    ],
  },
  {
    slug: "mars-polar-lander",
    no: 8,
    name: "Mars Polar Lander",
    designation: "Mars Surveyor '98 lander",
    kind: "Lander",
    category: "lost",
    body: "mars",
    builder: "Lockheed Martin",
    summary:
      "Built to dig near the south pole of Mars, it went silent as it began its descent and was never heard from again.",
    image: "polar-lander",
    card: "card-polar-lander",
    photo: N("KSC-98pc1229"),
    photos: { born: N("KSC-98pc1229"), launch: N("KSC-99pc05"), end: N("PIA02349") },
    launch: { date: "1999-01-03", rocket: "Delta II 7425", pad: "Space Launch Complex 17B" },
    end: {
      date: "1999-12-03",
      how: "lost",
      label: "Lost on arrival",
      story: "Contact ended as planned before atmospheric entry and never came back. The likeliest cause is that the engines shut off too early, before touchdown.",
    },
    restingPlace: "Planum Australe, Mars (presumed)",
    coords: { lat: -76, lon: 165, approx: true },
    stats: [
      { value: "11 months", label: "in flight", icon: "timer" },
      { value: "0", label: "signals from the surface", icon: "spark" },
      { value: "1999", label: "lost on arrival", icon: "calendar" },
    ],
    specs: [
      { label: "Builder", value: "Lockheed Martin" },
      { label: "Rocket", value: "Delta II 7425" },
      { label: "Passengers", value: "2 Deep Space 2 probes" },
      { label: "Target", value: "Near the south polar cap" },
    ],
    chapters: [
      { title: "Testing", year: "1998", text: "At Kennedy Space Center the top of the lander was removed for functional tests of its science instruments.", image: N("KSC-98pc1229") },
      { title: "Liftoff", year: "3 January 1999", text: "A Delta II lifted off from Launch Complex 17B at 3:21:10 p.m. EST.", image: N("KSC-99pc05") },
      { title: "Silence", year: "3 December 1999", text: "Arrival day was also last contact. The two Deep Space 2 probes riding along were lost too.", image: N("PIA02349") },
      { title: "The search", year: "1999–2000", text: "Mars Global Surveyor looked for the lander. NASA ended attempts to contact it on 17 January 2000.", image: N("PIA02349") },
    ],
    links: [
      { label: "NASA Science: Mars Polar Lander / Deep Space 2", url: SCI("mars-polar-lander-deep-space-2") },
      { label: "NSSDCA catalogue entry", url: NSSDCA("1999-001A") },
      { label: "Mars Polar Lander images in the NASA Image Library", url: LIB("Mars Polar Lander") },
    ],
    gallery: [N("KSC-98pc1229"), N("KSC-99pc05"), N("PIA02349")],
    sources: [
      { label: "NSSDCA: Mars Polar Lander", url: NSSDCA("1999-001A") },
      { label: "NASA Science: Mars Polar Lander / Deep Space 2", url: SCI("mars-polar-lander-deep-space-2") },
    ],
  },
  {
    slug: "spirit",
    no: 9,
    name: "Spirit",
    designation: "Mars Exploration Rover A",
    kind: "Rover",
    category: "rover",
    body: "mars",
    builder: "JPL",
    summary:
      "Opportunity's twin. Spirit climbed the Columbia Hills and, even with one wheel dragging, uncovered nearly pure silica that pointed to ancient hot springs.",
    image: "spirit",
    card: "card-spirit",
    photo: N("PIA16442"),
    photos: { born: N("PIA04835"), launch: N("KSC-03pd1900"), landing: N("PIA05040"), end: N("PIA12007") },
    launch: { date: "2003-06-10", rocket: "Delta II 7925", pad: "Space Launch Complex 17A" },
    landing: { date: "2004-01-04", site: "Gusev crater", method: "Airbag landing" },
    end: {
      date: "2010-03-22",
      how: "winter",
      label: "Last signal",
      story: "Stuck in soft sand at a spot called Troy since 2009, Spirit could not tilt its panels toward the winter sun. It last called home on 22 March 2010.",
    },
    restingPlace: "Gusev crater, Mars",
    coords: { lat: -14.57, lon: 175.48 },
    stats: [
      { value: "7.73 km", label: "driven", icon: "route" },
      { value: "90", label: "sols planned", icon: "timer" },
      { value: "6+ years", label: "on Mars", icon: "calendar" },
    ],
    specs: [
      { label: "Builder", value: "JPL" },
      { label: "Mass", value: "185 kg" },
      { label: "Height", value: "1.5 m" },
    ],
    chapters: [
      { title: "Gusev crater", year: "2004", text: "Landed on 4 January 2004 in a crater thought to hold an ancient lake bed.", image: N("PIA05040") },
      { title: "Bonneville", year: "2004", text: "Drove about 370 m to Bonneville crater before heading for the Columbia Hills.", image: N("PIA05570") },
      { title: "Columbia Hills", year: "2004–2005", text: "Climbed the hills and reached the summit of Husband Hill in 2005.", image: N("PIA02055") },
      { title: "Sunset", year: "19 May 2005", text: "Watched the Sun sink below the rim of Gusev crater on its 489th Martian day.", image: N("PIA07997") },
      { title: "Silica", year: "2007", text: "A dragging wheel churned up soil that was nearly pure silica.", image: N("PIA09491") },
      { title: "Troy", year: "2009–2010", text: "Wheels broke through a crust into soft sand and Spirit could not get free.", image: N("PIA12007") },
    ],
    model: { src: "/models/mer-opportunity.glb", title: "Mars Exploration Rover", source: NASA3D("Mars Exploration Rover - Opportunity (MER-B)"), note: "NASA's model of Opportunity. Spirit was its identical twin." },
    links: [
      { label: "NASA Science: Spirit", url: SCI("mer-spirit") },
      { label: "Mars Exploration Rovers mission page", url: SCI("mars-exploration-rovers-spirit-and-opportunity") },
      { label: "NSSDCA catalogue entry", url: NSSDCA("2003-027A") },
      { label: "Spirit photos in the NASA Image Library", url: LIB("Spirit rover") },
      { label: "Download the 3D model (NASA 3D Resources)", url: NASA3D("Mars Exploration Rover - Opportunity (MER-B)") },
    ],
    gallery: [N("PIA16442"), N("PIA16440"), N("PIA07997"), N("PIA05040"), N("PIA05570"), N("PIA09491"), N("PIA02055"), N("PIA12007"), N("KSC-03pd1900"), N("PIA04835")],
    twin: "opportunity",
    sources: [
      { label: "NASA Science: Spirit", url: SCI("mer-spirit") },
      { label: "Photojournal: PIA07997", url: PJ("PIA07997") },
    ],
  },
  {
    slug: "opportunity",
    no: 10,
    name: "Opportunity",
    nickname: "Oppy",
    designation: "Mars Exploration Rover B",
    kind: "Rover",
    category: "rover",
    body: "mars",
    builder: "JPL",
    summary:
      "Planned for 90 sols, Opportunity drove for more than 14 years. It crossed 45 km of Mars and found clear evidence that water once soaked its rocks.",
    image: "opportunity",
    card: "card-opportunity",
    photo: N("PIA18079"),
    photos: { born: N("PIA04834"), launch: N("KSC-03pd2090"), landing: N("PIA21494"), end: N("PIA22521") },
    launch: { date: "2003-07-07", time: "23:18 EDT", rocket: "Delta II 7925H", pad: "Space Launch Complex 17B" },
    landing: { date: "2004-01-25", site: "Eagle crater", method: "Airbag landing" },
    end: {
      date: "2018-06-10",
      how: "dust",
      label: "Last signal",
      story:
        "A planet-wide dust storm blotted out the Sun. Opportunity's final data, sent on 10 June 2018, showed very low power and a darkening sky. Engineers sent more than a thousand commands without a reply and declared the mission complete on 13 February 2019. The often-shared line \"My battery is low and it's getting dark\" is a journalist's paraphrase of that data, not a transmission.",
    },
    restingPlace: "Meridiani Planum, Mars",
    coords: { lat: -1.95, lon: -5.53 },
    stats: [
      { value: "45.16 km", label: "driven", icon: "route" },
      { value: "90", label: "sols planned", icon: "timer" },
      { value: "14+ years", label: "on Mars", icon: "calendar" },
    ],
    specs: [
      { label: "Builder", value: "JPL" },
      { label: "Mass", value: "185 kg" },
      { label: "Height", value: "1.5 m" },
    ],
    parts: [
      { label: "Pancam mast", x: 33, y: 8, side: "left" },
      { label: "High-gain antenna", x: 66, y: 34, side: "right" },
      { label: "Solar arrays", x: 22, y: 45, side: "left" },
      { label: "Rocker-bogie wheels", x: 58, y: 78, side: "right" },
      { label: "Robotic arm", x: 30, y: 62, side: "left" },
    ],
    chapters: [
      { title: "Eagle crater", year: "2004", text: "Rolled to a stop inside a small crater beside exposed bedrock. Its landing platform is still there.", image: N("PIA21494") },
      { title: "Blueberries", year: "2004", text: "Tiny hematite spheres and layered bedrock showed that liquid water once soaked these rocks.", image: N("PIA05273") },
      { title: "Victoria crater", year: "2006–2008", text: "Spent two years exploring the rim and walls of a crater 750 m wide.", image: N("PIA08812") },
      { title: "Endeavour crater", year: "2011", text: "Reached a crater 22 km wide and found a bright vein of gypsum.", image: N("PIA14509") },
      { title: "Marathon", year: "2015", text: "Passed the length of a marathon, 42.2 km, in March 2015.", image: N("PIA19157") },
      { title: "The storm", year: "2018", text: "A planet-wide dust storm cut off the sunlight it needed for power.", image: N("PIA22521") },
    ],
    story: [
      { title: "Launch", year: "July 2003", text: "A Delta II carried Opportunity off Cape Canaveral at 23:18 EDT on 7 July 2003.", image: N("KSC-03pd2090") },
      { title: "Landing", year: "January 2004", text: "Wrapped in airbags, it bounced across Meridiani Planum and rolled into Eagle crater.", image: N("PIA21494") },
      { title: "Water evidence", year: "2004", text: "Tiny hematite spheres and layered bedrock showed that liquid water once soaked these rocks.", image: N("PIA05273") },
      { title: "Endeavour crater", year: "2011", text: "After three years of driving, it reached a crater 22 km wide and found a vein of gypsum left by water.", image: N("PIA14509") },
      { title: "The storm", year: "June 2018", text: "A planet-wide dust storm blocks the sunlight Opportunity needs for power.", image: N("PIA22521") },
      { title: "Last signal", year: "10 June 2018", text: "Its final data showed very low power and a dark sky. Then silence. The mission was declared complete on 13 February 2019.", image: N("PIA22222") },
    ],
    discoveries: [
      { title: "Hematite spherules", image: N("PIA05273") },
      { title: "Evidence of past water", image: N("PIA14509") },
      { title: "Record distance off Earth", image: N("PIA19157") },
    ],
    route: {
      km: "45.16 km",
      points: [
        { name: "Eagle", x: 10, y: 28 },
        { name: "Endurance", x: 34, y: 44 },
        { name: "Victoria", x: 56, y: 66 },
        { name: "Endeavour", x: 86, y: 56 },
      ],
    },
    model: { src: "/models/mer-opportunity.glb", title: "Mars Exploration Rover (MER-B)", source: NASA3D("Mars Exploration Rover - Opportunity (MER-B)") },
    links: [
      { label: "NASA Science: Opportunity", url: SCI("mer-opportunity") },
      { label: "Mars Exploration Rovers mission page", url: SCI("mars-exploration-rovers-spirit-and-opportunity") },
      { label: "NSSDCA catalogue entry", url: NSSDCA("2003-032A") },
      { label: "Opportunity photos in the NASA Image Library", url: LIB("Opportunity rover") },
      { label: "Download the 3D model (NASA 3D Resources)", url: NASA3D("Mars Exploration Rover - Opportunity (MER-B)") },
    ],
    gallery: [N("PIA18079"), N("PIA22222"), N("PIA21494"), N("PIA05273"), N("PIA08812"), N("PIA14509"), N("PIA19157"), N("PIA22521"), N("KSC-03pd2090"), N("PIA04834")],
    twin: "spirit",
    sources: [
      { label: "NASA Science: Opportunity", url: "https://science.nasa.gov/mission/mer-opportunity/" },
      { label: "NSSDCA: MER-B", url: NSSDCA("2003-032A") },
      { label: "Photojournal: PIA22521", url: PJ("PIA22521") },
      { label: "Photojournal: PIA21494", url: PJ("PIA21494") },
    ],
  },
  {
    slug: "phoenix",
    no: 11,
    name: "Phoenix",
    designation: "Phoenix Mars lander",
    kind: "Lander",
    category: "lander",
    body: "mars",
    builder: "Lockheed Martin",
    summary:
      "The first spacecraft to land in the Martian arctic. Its robotic arm dug down to water ice just under the soil.",
    image: "phoenix",
    card: "card-phoenix",
    photo: N("PIA11719"),
    photos: { born: N("KSC-07PD-1085"), launch: N("KSC-07pd2166"), landing: N("PIA13804"), end: N("PIA12338") },
    launch: { date: "2007-08-04", rocket: "Delta II 7925", pad: "Space Launch Complex 17A" },
    landing: { date: "2008-05-25", site: "Vastitas Borealis", method: "Powered descent" },
    end: {
      date: "2008-11-02",
      how: "winter",
      label: "Last signal",
      story: "As the arctic winter set in, the Sun sank too low to power the lander. Its last signal came on 2 November 2008.",
    },
    restingPlace: "Vastitas Borealis, Mars",
    coords: { lat: 68.22, lon: -125.75 },
    stats: [
      { value: "90", label: "sols planned", icon: "timer" },
      { value: "5 months", label: "on Mars", icon: "calendar" },
      { value: "Ice", label: "touched on Mars", icon: "spark" },
    ],
    specs: [
      { label: "Builder", value: "Lockheed Martin" },
      { label: "Landing site", value: "68.22° N, farther north than any earlier lander" },
      { label: "Camera mast", value: "2 m" },
      { label: "Instruments", value: "SSI, RAC, MECA, TEGA, weather station" },
    ],
    chapters: [
      { title: "Preparation", year: "2007", text: "Technicians at Kennedy Space Center attached a crane to remove the heat shield from around Phoenix.", image: N("KSC-07PD-1085") },
      { title: "Arctic touchdown", year: "25 May 2008", text: "The first successful landing of a stationary lander on Mars since Viking 2, about 32 years earlier.", image: N("PIA13804") },
      { title: "Disappearing ice", year: "June 2008", text: "Bright patches in the trench nicknamed Dodo-Goldilocks sublimated away over four days: water ice.", image: N("PIA10906") },
      { title: "Digging", year: "2008", text: "Its robotic arm dug trenches such as La Mancha to reach the ice under the soil.", image: N("PIA11720") },
      { title: "Winter", year: "2008–2009", text: "As the Sun sank, the lander lost power. Orbital images later showed it under the winter frost.", image: N("PIA12338") },
      { title: "A decade later", year: "2018", text: "Mars Reconnaissance Orbiter photographed Phoenix nearly ten years after landing.", image: N("PIA22223") },
    ],
    links: [
      { label: "NASA Science: Phoenix", url: SCI("phoenix") },
      { label: "NSSDCA catalogue entry", url: NSSDCA("2007-034A") },
      { label: "Phoenix photos in the NASA Image Library", url: LIB("Phoenix Mars Lander") },
    ],
    gallery: [N("PIA11719"), N("PIA13804"), N("PIA10906"), N("PIA11720"), N("PIA22223"), N("PIA12338"), N("KSC-07PD-1085"), N("KSC-07pd2166")],
    sources: [
      { label: "NASA Science: Phoenix", url: SCI("phoenix") },
      { label: "Photojournal: PIA10906", url: PJ("PIA10906") },
    ],
  },
  {
    slug: "lcross",
    no: 12,
    name: "LCROSS",
    designation: "Lunar Crater Observation and Sensing Satellite",
    kind: "Impactor",
    category: "impactor",
    body: "moon",
    builder: "Northrop Grumman",
    summary:
      "LCROSS steered its spent rocket stage into a dark polar crater, flew through the plume and found water.",
    image: "lcross",
    card: "card-lcross",
    photo: N("KSC-2009-1754"),
    photos: { born: N("KSC-2009-1754"), launch: N("200906180001HQ") },
    launch: { date: "2009-06-18", rocket: "Atlas V 401", pad: "Space Launch Complex 41" },
    end: {
      date: "2009-10-09",
      how: "impact",
      label: "Impact",
      story: "The Centaur stage struck Cabeus crater first. LCROSS followed four minutes later, sending data until the moment it hit.",
    },
    restingPlace: "Cabeus crater, Moon",
    coords: { lat: -84.7, lon: -48.7 },
    stats: [
      { value: "4 min", label: "behind the Centaur", icon: "timer" },
      { value: "Water", label: "found in the plume", icon: "spark" },
      { value: "2009", label: "impact", icon: "calendar" },
    ],
    specs: [
      { label: "Builder", value: "Northrop Grumman" },
      { label: "Mission lead", value: "NASA Ames Research Center" },
      { label: "Mass", value: "621 kg" },
      { label: "Instruments", value: "Cameras and spectrometers (visible, near- and mid-infrared)" },
    ],
    chapters: [
      { title: "Arrival in Florida", year: "February 2009", text: "LCROSS arrived at Astrotech in Florida from Northrop Grumman in Redondo Beach, California.", image: N("KSC-2009-1754") },
      { title: "Stacked with LRO", year: "May 2009", text: "LRO and LCROSS were lifted into the tower at Launch Complex 41.", image: N("KSC-2009-3298") },
      { title: "Liftoff", year: "18 June 2009", text: "They launched together on an Atlas V at 21:32 UT.", image: N("200906180001HQ") },
      { title: "A fuel scare", year: "August 2009", text: "A sensor problem burned 140 kg of propellant, more than half of what was left. The mission still had enough.", image: "lcross" },
      { title: "Water", year: "13 November 2009", text: "NASA announced that LCROSS data showed water near the Moon's south pole.", image: "moon-globe" },
    ],
    links: [
      { label: "NASA Science: LCROSS", url: SCI("lcross") },
      { label: "NSSDCA catalogue entry", url: NSSDCA("2009-031B") },
      { label: "LCROSS photos in the NASA Image Library", url: LIB("LCROSS") },
    ],
    gallery: [N("KSC-2009-1754"), N("KSC-2009-3298"), N("200906180001HQ")],
    sources: [
      { label: "NSSDCA: LCROSS", url: NSSDCA("2009-031B") },
      { label: "NASA Science: LCROSS", url: SCI("lcross") },
    ],
  },
  {
    slug: "grail",
    no: 13,
    name: "GRAIL",
    nickname: "Ebb & Flow",
    designation: "Gravity Recovery and Interior Laboratory",
    kind: "Twin orbiters",
    category: "impactor",
    body: "moon",
    builder: "Lockheed Martin",
    summary:
      "Twin spacecraft that flew in formation to map the Moon's gravity in more detail than ever before.",
    image: "grail",
    card: "card-grail",
    photo: N("KSC-2011-6352"),
    photos: { born: N("KSC-2011-6352"), launch: N("KSC-2011-6923"), end: N("PIA16493") },
    launch: { date: "2011-09-10", rocket: "Delta II 7920H", pad: "Space Launch Complex 17B" },
    end: {
      date: "2012-12-17",
      how: "impact",
      label: "Impact",
      story: "Low on fuel, Ebb and Flow were flown into a mountain near the north pole. The site was named after Sally K. Ride.",
    },
    restingPlace: "Sally K. Ride Impact Site, Moon",
    coords: { lat: 75.6, lon: -26.6 },
    stats: [
      { value: "2", label: "spacecraft", icon: "spark" },
      { value: "1 year", label: "in lunar orbit", icon: "timer" },
      { value: "2012", label: "impact", icon: "calendar" },
    ],
    specs: [
      { label: "Builder", value: "Lockheed Martin" },
      { label: "Mass", value: "202.4 kg each" },
      { label: "Instruments", value: "Lunar Gravity Ranging System, MoonKAM, radio beacon" },
      { label: "Names", value: "Chosen by fourth-graders in Bozeman, Montana" },
    ],
    chapters: [
      { title: "Final checks", year: "August 2011", text: "Lockheed Martin technicians prepared GRAIL-A at Astrotech in Titusville, Florida.", image: N("KSC-2011-6352") },
      { title: "Stacked", year: "August 2011", text: "The twins were lowered onto the second stage of their Delta II.", image: N("PIA14558") },
      { title: "Liftoff", year: "10 September 2011", text: "A Delta II launched both spacecraft from Space Launch Complex 17B.", image: N("KSC-2011-6923") },
      { title: "Named by children", year: "2012", text: "Fourth-graders at Emily Dickinson Elementary School in Bozeman, Montana named them Ebb and Flow. Students also chose targets for their MoonKAM cameras.", image: N("PIA15514") },
      { title: "Mapping gravity", year: "2012", text: "They produced the highest-resolution gravity map of any celestial body to date and pinpointed mascons under the surface.", image: N("PIA16603") },
      { title: "Final flight", year: "17 December 2012", text: "Both spacecraft were flown into a mountain near the north pole at about 1.7 km per second.", image: N("PIA16493") },
    ],
    links: [
      { label: "NASA Science: GRAIL", url: SCI("grail") },
      { label: "NSSDCA catalogue entry", url: NSSDCA("2011-046A") },
      { label: "GRAIL images in the NASA Image Library", url: LIB("GRAIL") },
    ],
    gallery: [N("KSC-2011-6352"), N("PIA14558"), N("KSC-2011-6923"), N("PIA15514"), N("PIA16603"), N("PIA16493")],
    sources: [
      { label: "NSSDCA: GRAIL-A", url: NSSDCA("2011-046A") },
      { label: "NASA Science: GRAIL", url: SCI("grail") },
    ],
  },
  {
    slug: "insight",
    no: 14,
    name: "InSight",
    designation: "Interior Exploration using Seismic Investigations, Geodesy and Heat Transport",
    kind: "Lander",
    category: "lander",
    body: "mars",
    builder: "Lockheed Martin",
    summary:
      "InSight listened to Mars. Its seismometer recorded more than 1,300 marsquakes and revealed the planet's crust, mantle and core.",
    image: "insight",
    card: "card-insight",
    photo: N("PIA23203"),
    photos: { born: N("PIA19402"), launch: N("NHQ201805050001"), landing: N("PIA22876"), end: N("PIA25680") },
    launch: { date: "2018-05-05", rocket: "Atlas V 401", pad: "Vandenberg SLC-3E" },
    landing: { date: "2018-11-26", site: "Elysium Planitia", method: "Powered descent" },
    end: {
      date: "2022-12-15",
      how: "dust",
      label: "Last signal",
      story: "Dust slowly covered its solar panels. InSight last spoke to Earth on 15 December 2022, and the mission ended six days later.",
    },
    restingPlace: "Elysium Planitia, Mars",
    coords: { lat: 4.5, lon: 135.62 },
    stats: [
      { value: "1,319", label: "marsquakes", icon: "spark" },
      { value: "4 years", label: "on Mars", icon: "calendar" },
      { value: "2018", label: "first West Coast launch to another planet", icon: "timer" },
    ],
    specs: [
      { label: "Builder", value: "Lockheed Martin" },
      { label: "Design", value: "Based on the Phoenix lander" },
      { label: "Robotic arm", value: "1.8 m" },
      { label: "Instruments", value: "Seismometer, heat-flow probe, weather sensors" },
    ],
    chapters: [
      { title: "Assembly", year: "2015", text: "Lockheed Martin specialists built the lander in a clean room in Denver.", image: N("PIA19402") },
      { title: "Liftoff", year: "5 May 2018", text: "An Atlas V launched InSight from Vandenberg Air Force Base in California.", image: N("NHQ201805050001") },
      { title: "First selfie", year: "6 December 2018", text: "Ten days after landing, InSight photographed its own deck and solar panels.", image: N("PIA22876") },
      { title: "Seismometer down", year: "December 2018", text: "The robotic arm set the seismometer on the Martian surface.", image: N("PIA22956") },
      { title: "Dusty", year: "2019", text: "Its second selfie showed a thin coat of dust settling on the lander.", image: N("PIA23203") },
      { title: "Final selfie", year: "24 April 2022", text: "Much dustier now, on its 1,211th Martian day.", image: N("PIA25287") },
      { title: "One of the last images", year: "11 December 2022", text: "Its seismometer on the surface, photographed on the 1,436th Martian day.", image: N("PIA25680") },
    ],
    model: { src: "/models/insight-lander.glb", title: "InSight lander (arm deployed)", source: NASA3D("InSight Cruise Lander") },
    links: [
      { label: "NASA Science: InSight", url: SCI("insight") },
      { label: "NSSDCA catalogue entry", url: NSSDCA("2018-042A") },
      { label: "InSight photos in the NASA Image Library", url: LIB("InSight lander") },
      { label: "Download the 3D model (NASA 3D Resources)", url: NASA3D("InSight Cruise Lander") },
    ],
    gallery: [N("PIA23203"), N("PIA22876"), N("PIA22956"), N("PIA22959"), N("PIA25287"), N("PIA25680"), N("PIA19402"), N("NHQ201805050001")],
    sources: [
      { label: "NASA Science: InSight", url: SCI("insight") },
      { label: "Photojournal: PIA25287", url: PJ("PIA25287") },
      { label: "Photojournal: PIA25680", url: PJ("PIA25680") },
    ],
  },
  {
    slug: "ingenuity",
    no: 15,
    name: "Ingenuity",
    nickname: "Ginny",
    designation: "Mars Helicopter",
    kind: "Helicopter",
    category: "helicopter",
    body: "mars",
    builder: "JPL",
    summary:
      "The first aircraft to make a powered, controlled flight on another planet. Planned for 5 flights, it flew 72.",
    image: "ingenuity",
    card: "card-ingenuity",
    photo: N("PIA24542"),
    photos: { born: N("PIA23151"), launch: N("KSC-20200730-PH-FMX01_0042"), landing: N("PIA24542"), end: N("PIA26236") },
    launch: { date: "2020-07-30", rocket: "Atlas V 541", pad: "Space Launch Complex 41" },
    landing: { date: "2021-02-18", site: "Jezero crater", method: "Carried under Perseverance" },
    end: {
      date: "2024-01-18",
      how: "grounded",
      label: "Final flight",
      story: "On its 72nd flight a rotor blade was damaged. Ingenuity could no longer fly, and the mission was declared over on 25 January 2024.",
    },
    restingPlace: "Jezero crater, Mars",
    coords: { lat: 18.44, lon: 77.45 },
    stats: [
      { value: "72", label: "flights", icon: "spark" },
      { value: "5", label: "flights planned", icon: "timer" },
      { value: "3 years", label: "on Mars", icon: "calendar" },
    ],
    specs: [
      { label: "Builder", value: "JPL" },
      { label: "Flights", value: "72 (5 planned)" },
      { label: "Rode to Mars", value: "Under the Perseverance rover" },
      { label: "Home", value: "Jezero crater" },
    ],
    chapters: [
      { title: "Liftoff", year: "30 July 2020", text: "It left Earth folded under Perseverance on an Atlas V from Cape Canaveral.", image: N("KSC-20200730-PH-FMX01_0042") },
      { title: "A selfie together", year: "6 April 2021", text: "Perseverance photographed itself with Ingenuity standing about 3.9 m away.", image: N("PIA24542") },
      { title: "First flight", year: "19 April 2021", text: "The first powered, controlled flight on another planet.", image: N("PIA24550") },
      { title: "Its own shadow", year: "22 April 2021", text: "On its second flight the downward camera caught the helicopter's shadow on Jezero crater.", image: N("PIA24592") },
      { title: "The rover from the air", year: "25 April 2021", text: "From 5 m up on its third flight, Ingenuity spotted Perseverance about 85 m away.", image: N("PIA24625") },
      { title: "A broken blade", year: "18 January 2024", text: "After its 72nd flight it photographed the shadow of a damaged rotor blade.", image: N("PIA26243") },
      { title: "Final airfield", year: "February 2024", text: "Perseverance photographed Ingenuity where it completed its last flight.", image: N("PIA26236") },
    ],
    model: { src: "/models/ingenuity.glb", title: "Ingenuity Mars Helicopter", source: NASA3D("Ingenuity Mars Helicopter") },
    links: [
      { label: "NASA Science: Ingenuity", url: SCI("mars-2020-perseverance/ingenuity-mars-helicopter") },
      { label: "NSSDCA catalogue entry", url: NSSDCA("2020-052A") },
      { label: "Ingenuity photos in the NASA Image Library", url: LIB("Ingenuity helicopter") },
      { label: "Download the 3D model (NASA 3D Resources)", url: NASA3D("Ingenuity Mars Helicopter") },
    ],
    gallery: [N("PIA24542"), N("PIA24550"), N("PIA24592"), N("PIA24625"), N("PIA26243"), N("PIA26236"), N("PIA26237"), N("KSC-20200730-PH-FMX01_0042"), N("PIA23151")],
    sources: [
      { label: "NASA Science: Ingenuity", url: SCI("mars-2020-perseverance/ingenuity-mars-helicopter") },
      { label: "Photojournal: PIA26236", url: PJ("PIA26236") },
    ],
  },
];

export const getHero = (slug: string) => HEROES.find((h) => h.slug === slug);

export const catNo = (n: number) => `No. ${String(n).padStart(2, "0")}`;

export const year = (iso: string) => Number(iso.slice(0, 4));

/** First year the machine reached its world (or launched, for those that never landed). */
export const startYear = (h: Hero) => year(h.landing?.date ?? h.launch.date);

export const lifespan = (h: Hero) => {
  const a = startYear(h);
  const b = year(h.end.date);
  return a === b ? String(a) : `${a}–${b}`;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "10 Jun 2018" */
export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

/** "10 June 2018" */
export const fmtLong = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS_LONG[m - 1]} ${y}`;
};

/** "10.06.2018" */
export const fmtDots = (iso: string) => iso.split("-").reverse().join(".");

export const fmtCoords = ({ lat, lon, approx }: Hero["coords"]) =>
  `${approx ? "~" : ""}${Math.abs(lat).toFixed(2)}° ${lat < 0 ? "S" : "N"}, ${Math.abs(lon).toFixed(2)}° ${lon < 0 ? "W" : "E"}`;

export const bodyName = (b: Body) => (b === "mars" ? "Mars" : "Moon");

export const img = (name: string) => `/images/${name}.jpg`;

/** The best picture of the machine: a credited archive photo when there is one, otherwise the AI placeholder. */
export const portrait = (h: Hero) => h.photo ?? h.image;

/** True for AI-made placeholder images (anything that is not a credited `nasa/` archive photo). */
export const isAIImage = (name: string) => !name.startsWith("nasa/");

/** Chapters for Story mode: the hand-written story when there is one, otherwise built from the record. */
export function storyChapters(h: Hero): Chapter[] {
  if (h.story) return h.story;
  return [
    { title: "Launch", year: fmtLong(h.launch.date), text: `${h.name} left Earth on a ${h.launch.rocket} from ${h.launch.pad}.`, image: h.photos?.launch ?? "launch" },
    ...(h.landing
      ? [{ title: "Arrival", year: fmtLong(h.landing.date), text: `${h.landing.method} at ${h.landing.site}.`, image: h.photos?.landing ?? portrait(h) }]
      : []),
    ...(h.chapters ?? []),
    ...(h.chapters ? [] : [{ title: "Life’s work", year: lifespan(h), text: h.summary, image: h.gallery[1] ?? portrait(h) }]),
    { title: h.end.label, year: fmtLong(h.end.date), text: h.end.story, image: h.photos?.end ?? portrait(h) },
  ];
}

/** The next hero in the catalogue, wrapping around. */
export const nextHero = (h: Hero) => HEROES[(HEROES.indexOf(h) + 1) % HEROES.length];
