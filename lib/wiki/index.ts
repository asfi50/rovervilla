import type { WikiEntry } from "./types";
import { RANGER_7 } from "./ranger-7";
import { SURVEYOR_1 } from "./surveyor-1";
import { APOLLO_11_LANDER } from "./apollo-11-lander";
import { APOLLO_15_ROVER } from "./apollo-15-rover";
import { VIKING_1, VIKING_2 } from "./viking";
import { PATHFINDER } from "./pathfinder-sojourner";
import { MARS_POLAR_LANDER } from "./mars-polar-lander";
import { SPIRIT } from "./spirit";
import { OPPORTUNITY } from "./opportunity";
import { PHOENIX } from "./phoenix";
import { LCROSS } from "./lcross";
import { GRAIL } from "./grail";
import { INSIGHT } from "./insight";
import { INGENUITY } from "./ingenuity";

export const WIKI: Record<string, WikiEntry> = {
  "ranger-7": RANGER_7,
  "surveyor-1": SURVEYOR_1,
  "apollo-11-lander": APOLLO_11_LANDER,
  "apollo-15-rover": APOLLO_15_ROVER,
  "viking-1": VIKING_1,
  "viking-2": VIKING_2,
  "pathfinder-sojourner": PATHFINDER,
  "mars-polar-lander": MARS_POLAR_LANDER,
  spirit: SPIRIT,
  opportunity: OPPORTUNITY,
  phoenix: PHOENIX,
  lcross: LCROSS,
  grail: GRAIL,
  insight: INSIGHT,
  ingenuity: INGENUITY,
};

export type { WikiEntry } from "./types";
