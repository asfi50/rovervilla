/**
 * Touchdown's script. "Ground" (the voice on the radio), the player and the lander are made up,
 * and the game says so. Every fact Ground mentions comes from the hero's entry in lib/wiki or
 * lib/heroes.ts, which list their NASA sources; keep it that way when editing these lines.
 */

export type Line = { who: "ground" | "note"; text: string };

const g = (text: string): Line => ({ who: "ground", text });

export const PROLOGUE: Line[] = [
  g("This is Ground. Can you hear me? Good."),
  g("Between 1964 and 2020 we sent machines to the Moon and to Mars. This archive remembers fifteen of them."),
  g("Some landed softly. Some were flown into the ground on purpose. One was never heard from again after it arrived."),
  g("Every one of them, one day, went quiet."),
  g("Your lander is small and your fuel is short. Land near each one, drive over, and see how it went quiet."),
  { who: "note", text: "The places, dates and machines are real. You, your lander and the voice on the radio are made up." },
];

/** Ground's briefing before each descent. Sources: lib/wiki/<slug>.ts and lib/heroes.ts. */
export const BRIEF: Record<string, string[]> = {
  "ranger-7": [
    "Ranger 7 came down here on 31 July 1964, on the northern rim of the Sea of Clouds. The area was renamed Mare Cognitum, the Known Sea.",
    "It ended a run of 13 failed American attempts at the Moon. This time the cameras switched on as planned.",
    "It took pictures all the way down. The last one was taken 2.3 seconds before impact. There's no lander to find, only its crater. Come in gentler than it did.",
  ],
  "surveyor-1": [
    "Oceanus Procellarum, the Ocean of Storms. Surveyor 1 touched down here on 2 June 1966.",
    "It was America's first soft landing on the Moon, on the first attempt, three years before Apollo 11. It proved the ground could hold a lander.",
    "It slept through the lunar nights and answered again, on and off, for seven months. Final contact came on 7 January 1967.",
  ],
  "apollo-11-lander": [
    "Tranquility Base. Eagle landed here at 4:17 p.m. Eastern time on 20 July 1969, with Neil Armstrong and Buzz Aldrin aboard.",
    "On 21 July they flew home in the ascent stage. The descent stage stayed behind as their launch pad, with a plaque on one leg.",
    "It is still standing. Land in the ring, not on history, and drive over.",
  ],
  "apollo-15-rover": [
    "Hadley–Apennine, between the Apennine mountains and Hadley Rille. Apollo 15's lunar module Falcon landed here on 30 July 1971.",
    "The crew brought the first car ever driven on the Moon. On the first drive the front steering didn't work, so they steered with the rear wheels.",
    "On 2 August its TV camera broadcast Falcon's liftoff to Earth. Then it stayed, parked, where they left it.",
  ],
  "viking-1": [
    "Chryse Planitia. Viking 1 touched down here at 11:53:06 UT on 20 July 1976.",
    "It sent back the first pictures from the surface of Mars and scooped up soil to search for signs of life.",
    "It worked for more than six years, until a faulty command sent from Earth cut the link on 11 November 1982.",
  ],
  "viking-2": [
    "Utopia Planitia, about 6,460 km from its twin. Viking 2 landed here on 3 September 1976.",
    "In winter it photographed frost on the ground. Mind the rocks: the site is rockier than Viking 1's.",
    "Its batteries failed in April 1980, and it fell silent.",
  ],
  "pathfinder-sojourner": [
    "Ares Vallis. Pathfinder bounced down here inside airbags on 4 July 1997.",
    "It carried Sojourner, the first wheeled vehicle to work on another planet. Sojourner talked to Earth through the lander.",
    "The lander's last full transmission came on 27 September 1997. Sojourner went quiet with it.",
  ],
  "mars-polar-lander": [
    "Near the edge of the south polar cap. Mars Polar Lander was meant to set down somewhere around here and dig for water ice.",
    "Contact ended as planned before entry on 3 December 1999. It never came back.",
    "An investigation found a false touchdown signal most likely shut its engines down early. Watch your altitude. Don't cut the engine until you're down.",
  ],
  spirit: [
    "Gusev crater, on the other side of Mars from its twin. Spirit bounced down here in January 2004.",
    "It was planned for 90 sols. It climbed the Columbia Hills and, with one wheel dragging, uncovered nearly pure silica.",
    "In 2009 it got stuck in soft sand at a spot called Troy, and couldn't tilt its panels to the winter sun. It last called home on 22 March 2010.",
  ],
  opportunity: [
    "Meridiani Planum, on the rim of Endeavour crater. Opportunity was driving down a gully called Perseverance Valley when the storm came.",
    "It was designed to last 90 Martian days and drive one kilometre. It drove 45.16.",
    "In June 2018 a dust storm covered the whole planet. Its final data came on 10 June: very low power and a darkening sky.",
  ],
  phoenix: [
    "Vastitas Borealis, the Martian arctic. Phoenix landed here on 25 May 2008, farther north than any mission before it.",
    "Its robotic arm dug down to water ice just under the soil.",
    "When winter came the Sun sank too low to power it. Its last signal came on 2 November 2008.",
  ],
  lcross: [
    "Cabeus crater, near the Moon's south pole. Its floor is in permanent shadow. There will be no sunlight down there.",
    "On 9 October 2009 LCROSS sent its spent Centaur stage into the crater, flew through the plume, and about four minutes later hit the Moon itself.",
    "Its data showed water. Your landing lights will come on. Trust the instruments.",
  ],
  grail: [
    "A mountain near the Moon's north pole, now the Sally K. Ride Impact Site.",
    "Ebb and Flow were twins. They flew in tandem to map the Moon's gravity, the highest-resolution gravity map of any world at the time.",
    "Low on fuel, they were flown into this mountain on 17 December 2012. Land on the flat below it.",
  ],
  insight: [
    "Elysium Planitia. InSight landed here on 26 November 2018 to listen to the inside of Mars.",
    "Its seismometer recorded 1,319 marsquakes and revealed the planet's crust, mantle and core.",
    "Dust slowly covered its solar panels. It last spoke to Earth on 15 December 2022.",
  ],
  ingenuity: [
    "Jezero crater. Ingenuity rode here folded under the Perseverance rover and landed on 18 February 2021.",
    "On 19 April 2021 it made the first powered, controlled flight on another planet. It was built for up to five test flights. It flew 72.",
    "On its 72nd flight, on 18 January 2024, a rotor blade was damaged. It never flew again.",
  ],
};

/** Which three timeline entries become this site's echoes, by their date as written in lib/wiki. */
export const ECHO_DATES: Record<string, string[]> = {
  "ranger-7": ["January 1964", "28 July 1964", "2010"],
  "surveyor-1": ["2 June 1966", "14 June 1966", "6 July 1966"],
  "apollo-11-lander": ["25 May 1961", "16 July 1969", "20 July 1969"],
  "apollo-15-rover": ["26 July 1971", "31 July 1971", "1 August 1971"],
  "viking-1": ["20 July 1976", "28 July 1976", "January 1982"],
  "viking-2": ["3 September 1976", "12 September 1976", "July 2001"],
  "pathfinder-sojourner": ["4 December 1996", "4 July 1997", "5–6 July 1997"],
  "mars-polar-lander": ["3 January 1999", "23 September 1999", "17 January 2000"],
  spirit: ["6 February 2004", "29 September 2005", "2006"],
  opportunity: ["22 March 2004", "24 March 2015", "10 March 2016"],
  phoenix: ["19 June 2008", "31 July 2008", "5 August 2008"],
  lcross: ["18 June 2009", "22 August 2009", "13 November 2009"],
  grail: ["10 September 2011", "31 December 2011", "7 March – 29 May 2012"],
  insight: ["19 December 2018", "6 April 2019", "24 April 2022"],
  ingenuity: ["3 April 2021", "19 April 2021", "2021–2023"],
};

/** Ground's lines during play. None of these state facts about the real missions. */
export const RADIO: Record<string, string> = {
  chute: "Chute away. You have control.",
  braking: "Braking burn complete. You have control.",
  howto: "Hold Space to fire the engine and slow down; let go and you fall. Keep the speed bar green.",
  howtoTouch: "Hold the engine button to slow down; let go and you fall. Keep the speed bar green.",
  control: "You have control.",
  fuel: "Fuel's getting low. Make it count.",
  fuelOut: "That's the last of the fuel.",
  fast: "You're coming in fast. Hold Space and brake.",
  wind: "Gust coming through. Lean into it.",
  far: "Signal's getting weak out here. Turn back toward the beacon.",
  dark: "Landing lights on. It's dark down there.",
  landed: "Contact light. Engine off. Nicely done.",
  landedHard: "We're down. Hard, but down. The legs held.",
  landedFar: "You're down. Long drive ahead, though.",
  crashed: "Lander, Ground. Do you read? … Nothing. Let's try that again.",
  deploy: "Rover's on the ground. Follow the beam. The blue lights are echoes from the record. Pick them up if you like.",
  echo: "Got it. That one's from the record.",
  echoesAll: "That's every echo here.",
  arriveMachine: "There it is.",
  arriveCrater: "This is the spot.",
  arriveLost: "This is where it was meant to land. No one has seen it since.",
  computer: "Want the flight computer back? It holds your speed and drift, and it'll brake for you near the ground. Tap below.",
};

/** What Ground says after each new find, by how many have been found. */
export const MILESTONE: Record<number, string> = {
  1: "That's one heard. Fourteen still out there.",
  3: "Three. You're getting the hang of this.",
  5: "Five. A third of the way.",
  8: "More than halfway. It's quieter in here than it used to be. We're all listening.",
  12: "Twelve. Just three more.",
  14: "One left.",
};

export const FINALE: Line[] = [
  g("That's all fifteen."),
  g("Nine on Mars. Six on the Moon."),
  g("They don't answer any more. But they're still out there, where we left them."),
  g("Thank you for going to see them."),
  g("This is Ground. Signing off."),
];

/** A suggested order: by launch date, so the visits follow the history. */
export const ORDER = [
  "ranger-7",
  "surveyor-1",
  "apollo-11-lander",
  "apollo-15-rover",
  "viking-1",
  "viking-2",
  "pathfinder-sojourner",
  "mars-polar-lander",
  "spirit",
  "opportunity",
  "phoenix",
  "lcross",
  "grail",
  "insight",
  "ingenuity",
];
