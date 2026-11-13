/**
 * Where the machine sits inside each portrait, so cards can frame it precisely.
 * `box` is the machine's bounding box as [left, top, right, bottom] in % of the image.
 * Re-measure when an image is replaced.
 */
export type Frame = { w: number; h: number; box: [number, number, number, number] };

export const FRAMES: Record<string, Frame> = {
  opportunity: { w: 1370, h: 1148, box: [8, 4, 90, 88] },
  spirit: { w: 1536, h: 1024, box: [7, 7, 93, 82] },
  "viking-1": { w: 1536, h: 1024, box: [10, 5, 77, 73] },
  "viking-2": { w: 1536, h: 1024, box: [0, 3, 60, 61] },
  ingenuity: { w: 1536, h: 1024, box: [28, 14, 77, 54] },
  pathfinder: { w: 1536, h: 1024, box: [12, 38, 94, 74] },
  "polar-lander": { w: 1536, h: 1024, box: [24, 15, 52, 67] },
  phoenix: { w: 1536, h: 1024, box: [0, 13, 62, 68] },
  insight: { w: 1536, h: 1024, box: [5, 12, 95, 72] },
  ranger: { w: 1536, h: 1024, box: [14, 12, 79, 66] },
  surveyor: { w: 1312, h: 1199, box: [21, 1, 81, 90] },
  apollo: { w: 1312, h: 1199, box: [19, 2, 81, 62] },
  lrv: { w: 1536, h: 1024, box: [8, 3, 83, 88] },
  lcross: { w: 1536, h: 1024, box: [0, 20, 74, 75] },
  grail: { w: 1536, h: 1024, box: [8, 20, 91, 73] },
  sojourner: { w: 1370, h: 1148, box: [8, 29, 58, 72] },
};
