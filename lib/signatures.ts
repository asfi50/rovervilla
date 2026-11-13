/**
 * The one section on each hero's page that is built around its own life: Ranger 7's last
 * 17 minutes, Apollo 11's mission clock, Spirit's falling power, Ingenuity's flight log.
 * Facts only; every number here comes from that hero's wiki sources (lib/wiki).
 */

type Base = { title: string; intro: string };

export type Signature = Base &
  (
    | { kind: "frames"; frames: { image?: string; label: string; sub?: string }[] }
    | { kind: "clock"; events: { t: string; text: string; big?: boolean }[] }
    | { kind: "bars"; unit: string; bars: { label: string; value: number; note?: string; muted?: boolean }[] }
    | { kind: "stats"; items: { value: string; label: string }[]; compare?: { label: string; planned: number; actual: number; plannedText: string; actualText: string }[] }
    | { kind: "sequence"; steps: { label: string; text: string }[] }
    | { kind: "seismo"; items: { value: string; label: string }[] }
  );

export const SIGNATURES: Record<string, Signature> = {
  "ranger-7": {
    kind: "frames",
    title: "The last 17 minutes",
    intro: "Ranger 7 had one job: keep its cameras running all the way down. These are real frames from its fall.",
    frames: [
      { image: "nasa/PIA02975", label: "First picture", sub: "From 1,311 miles up; the large crater is Alphonsus" },
      { image: "nasa/PIA02974", label: "Closing in", sub: "Guericke crater, frame after frame" },
      { label: "Impact", sub: "The last image came 2.3 seconds before impact, from about 1,600 feet" },
    ],
  },
  "surveyor-1": {
    kind: "bars",
    title: "Surviving the night",
    intro: "Surveyor 1 had only a solar panel and batteries. No one knew if it would live through the 14-day lunar night. It did.",
    unit: "pictures",
    bars: [
      { label: "First lunar day, 2–14 June 1966", value: 10622 },
      { label: "Second lunar day, from 6 July 1966", value: 618, note: "after waking up from the night" },
    ],
  },
  "apollo-11-lander": {
    kind: "clock",
    title: "Mission clock",
    intro: "Times are hours and minutes after launch, as NASA's mission overview records them.",
    events: [
      { t: "100:12", text: "Eagle undocks from Columbia." },
      { t: "102:33", text: "Powered descent begins; the engine fires for 756.3 seconds." },
      { t: "4:17 p.m.", text: "Eagle lands in the Sea of Tranquility (EDT). NASA's account says 30 seconds of fuel remained.", big: true },
      { t: "109:42", text: "Armstrong steps onto the Moon. Aldrin follows about 20 minutes later." },
      { t: "21 h 36 m", text: "Total time on the surface." },
      { t: "124:22", text: "The ascent engine fires. The descent stage stays behind as the launch pad.", big: true },
    ],
  },
  "apollo-15-rover": {
    kind: "stats",
    title: "Three drives at Hadley",
    intro: "Apollo 11's astronauts walked a little over half a mile in total. With a rover, Apollo 15's crew went much farther.",
    items: [
      { value: "17.5 mi", label: "driven, about 28 km" },
      { value: "3 h 2 m", label: "of driving" },
      { value: "3", label: "trips from the lander" },
      { value: "67 h", label: "on the Moon" },
    ],
    compare: [{ label: "Apollo crews' total distance", planned: 0.5, actual: 17.5, plannedText: "Apollo 11: a little over 0.5 mi", actualText: "Apollo 15: 17.5 mi" }],
  },
  "viking-1": {
    kind: "sequence",
    title: "Looking for life",
    intro: "Viking's landers carried a biology laboratory. Here is what happened when Viking 1 tested the soil.",
    steps: [
      { label: "28 July 1976", text: "The robot arm scoops the first soil sample into the biology lab." },
      { label: "Four samples", text: "Taken together, the results could have been read as a weak positive sign of life." },
      { label: "Organics", text: "But the gas chromatograph mass spectrometer found no organic compounds." },
      { label: "Verdict", text: "Inconclusive. Mars missions since have kept asking the question Viking began." },
    ],
  },
  "viking-2": {
    kind: "stats",
    title: "Utopia",
    intro: "Viking 2 landed on a rockier, flatter plain than its twin, so featureless that orbiters could not pin down where it was.",
    items: [
      { value: "6,460 km", label: "from Viking 1" },
      { value: "8.5°", label: "tilted to the west" },
      { value: "47.97° N", label: "near the polar cap" },
      { value: "3", label: "soil samples tested for life" },
    ],
  },
  "pathfinder-sojourner": {
    kind: "stats",
    title: "Sojourner's backyard",
    intro: "The first wheeled vehicle on another planet never went far, but it went much longer than anyone planned. Its team named the rocks after cartoon characters: Barnacle Bill, Yogi, Scooby Doo.",
    items: [
      { value: "10.6 kg", label: "rover mass" },
      { value: "330 ft", label: "driven in total" },
      { value: "39 ft", label: "farthest from the lander" },
      { value: "550", label: "pictures from the rover" },
    ],
    compare: [
      { label: "Rover lifetime", planned: 7, actual: 83, plannedText: "Planned: 1 week", actualText: "Lasted: 83 days" },
      { label: "Lander lifetime", planned: 30, actual: 84, plannedText: "Planned: 1 month", actualText: "Lasted: nearly 3×" },
    ],
  },
  "mars-polar-lander": {
    kind: "sequence",
    title: "What most likely happened",
    intro: "No one saw the landing. This is the chain of events NASA's investigation found most likely.",
    steps: [
      { label: "3 December 1999", text: "The lander separates from its cruise stage to begin entry. Contact ends, as planned." },
      { label: "Descent", text: "A false signal tells the spacecraft it has already landed." },
      { label: "Engines off", text: "The main engines shut down too early." },
      { label: "Crash", text: "The lander falls to the surface. The two Deep Space 2 probes are never heard from either." },
      { label: "17 January 2000", text: "NASA ends its attempts to contact the lander." },
    ],
  },
  spirit: {
    kind: "bars",
    title: "Running on sunlight",
    intro: "Spirit lived on what its dusty solar panels could catch. In its last winter, stuck at Troy, it could not tilt them toward the Sun. Energy per Martian day, as NASA recorded it:",
    unit: "watt-hours a day",
    bars: [
      { label: "A normal day", value: 700 },
      { label: "Winter storm, end of 2008", value: 89, note: "too little to run on; it used its batteries" },
      { label: "April 2009", value: 372, note: "back to normal science" },
    ],
  },
  opportunity: {
    kind: "bars",
    title: "The odometer",
    intro: "It was built to drive 1 km.",
    unit: "km driven",
    bars: [
      { label: "Planned", value: 1, muted: true },
      { label: "May 2013: passes Apollo 17's lunar rover", value: 35.744 },
      { label: "July 2014: past Lunokhod 2's 39 km", value: 40.25 },
      { label: "24 March 2015: a marathon", value: 42.198 },
      { label: "Final, when the mission ended", value: 45.16 },
    ],
  },
  phoenix: {
    kind: "frames",
    title: "The ice that vanished",
    intro: "Bright clumps in a trench dug on Mars disappeared over four days. They had sublimated: water ice.",
    frames: [
      { image: "nasa/PIA10906", label: "Dodo-Goldilocks", sub: "June 2008: the bright material fades between frames" },
      { image: "nasa/PIA11720", label: "La Mancha", sub: "Another trench dug by the robotic arm" },
      { image: "nasa/PIA12338", label: "Winter", sub: "Later orbital images showed Phoenix under winter frost" },
    ],
  },
  lcross: {
    kind: "clock",
    title: "Impact day, 9 October 2009",
    intro: "Two impacts, four minutes apart. Times in UT.",
    events: [
      { t: "01:50", text: "The Centaur stage and LCROSS separate." },
      { t: "11:31", text: "The Centaur hits Cabeus crater, throwing up about 350 tonnes of lunar material.", big: true },
      { t: "+90 s", text: "The Lunar Reconnaissance Orbiter flies over and observes the impact point in infrared." },
      { t: "11:36", text: "LCROSS, having flown through the plume, hits the Moon at about 9,000 km/h.", big: true },
      { t: "13 Nov", text: "NASA announces that the data shows water near the Moon's south pole." },
    ],
  },
  grail: {
    kind: "stats",
    title: "Twins in tandem",
    intro: "The gap between Ebb and Flow changed by tiny amounts as they flew over denser and lighter rock. That was the measurement.",
    items: [
      { value: "202.4 kg", label: "each spacecraft" },
      { value: "~25 h", label: "between their arrivals" },
      { value: "9 months", label: "of gravity mapping" },
      { value: "1.68 km/s", label: "impact speed" },
    ],
  },
  insight: {
    kind: "seismo",
    title: "Listening to Mars",
    intro: "InSight's seismometer sat on the ground under a dome for four years. On 6 April 2019 it felt the first likely marsquake.",
    items: [
      { value: "1,319", label: "marsquakes" },
      { value: "6 Apr 2019", label: "first likely quake, sol 128" },
      { value: "5 m", label: "planned depth for the heat probe" },
      { value: "~40 cm", label: "how deep it got" },
    ],
  },
  ingenuity: {
    kind: "stats",
    title: "Flight log",
    intro: "Ingenuity was meant to prove one thing and then stop. It kept flying.",
    items: [
      { value: "72", label: "flights" },
      { value: "128.8 min", label: "in the air" },
      { value: "17.0 km", label: "flown" },
      { value: "24 m", label: "highest" },
      { value: "48", label: "airfields" },
      { value: "3", label: "emergency landings" },
    ],
    compare: [
      { label: "Flights", planned: 5, actual: 72, plannedText: "Planned: up to 5", actualText: "Flew: 72" },
      { label: "Time on Mars", planned: 30, actual: 1000, plannedText: "Planned: 30 days", actualText: "Lasted: almost 1,000 Martian days" },
    ],
  },
};
