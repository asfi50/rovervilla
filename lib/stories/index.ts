import type { Story } from "./types";
import { OPPORTUNITY } from "./opportunity";

/** Heroes with a cinematic story; the rest keep the chaptered story view. */
export const STORIES: Record<string, Story> = {
  opportunity: OPPORTUNITY,
};

export type { Story, Scene, Cam } from "./types";
