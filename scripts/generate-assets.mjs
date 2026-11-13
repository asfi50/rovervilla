// Generates placeholder imagery with OpenRouter (openai/gpt-image-2.5-sunburst, low quality).
// Usage: node scripts/generate-assets.mjs [name ...]   (no names = every missing asset)
//        node scripts/generate-assets.mjs --recrop      (redo card cut-outs from scripts/raw, free)
// Skips files that already exist, logs real cost per call, stops before BUDGET is reached.
// All output is AI-made placeholder art; swap for credited NASA public-domain photos before launch.

import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const MODEL = "openai/gpt-image-2.5-sunburst";
const BUDGET = 0.45;
const OUT = "public/images";
const LEDGER = "scripts/asset-costs.log";
const RAW = "scripts/raw";

const KEY = readFileSync(".env.local", "utf8").match(/OPENROUTER_API_KEY=(.+)/)?.[1]?.trim();
if (!KEY) throw new Error("OPENROUTER_API_KEY missing in .env.local");

const STYLE =
  "Photorealistic, cinematic, natural light, high detail, no text, no logos, no insignia, no flags, no people's faces in focus.";
const MARS = "on the rusty orange surface of Mars, rocks and fine dust, butterscotch sky";
const MOON = "on the grey cratered surface of the Moon, black sky, harsh sunlight";

/** Card cut-outs: the machine on a small patch of ground over pure white, trimmed after generation. */
const CARD = (machine, ground = "rusty orange Mars soil and a few rocks") =>
  `Museum exhibit photograph of ${machine}, shown whole, standing on a small irregular patch of ${ground}. Isolated on a pure white seamless background; the edges of the ground patch dissolve softly into the white. Three-quarter view, the entire machine in frame with generous margin, centred, soft natural daylight, photorealistic, high detail. No text, no logos, no insignia, no flags.`;

/** name -> prompt. Keep this list short: every entry costs money. */
export const ASSETS = {
  "card-opportunity": CARD("the six-wheeled Mars Exploration Rover Opportunity, with its tall camera mast, flat dusty solar panel deck and small dish antenna"),
  "card-spirit": CARD("the six-wheeled Mars Exploration Rover Spirit, dusty solar panels and tall camera mast, seen from the other side"),
  "card-viking-1": CARD("the Viking 1 Mars lander: a three-legged hexagonal white and silver lander body with a large dish antenna on a mast and a sampling arm"),
  "card-ingenuity": CARD("the Ingenuity Mars helicopter: a small cube body, two stacked long coaxial rotor blades and four thin splayed legs, resting on the ground"),
  "card-viking-2": CARD("the Viking 2 Mars lander: a three-legged hexagonal white and silver lander body with a large dish antenna, a little frost on the ground"),
  "card-phoenix": CARD("the Phoenix Mars lander: a three-legged lander with two round decagonal solar arrays and a robotic digging arm", "rusty Mars soil with patches of white ice"),
  "card-insight": CARD("the InSight Mars lander: a three-legged lander with two large round fan-shaped solar arrays, a robotic arm, and a small domed seismometer on the ground beside it"),
  "card-polar-lander": CARD("the Mars Polar Lander: a compact three-legged lander with two flat rectangular solar panels and a slim mast", "rusty Mars soil with a little white frost"),
  "card-surveyor": CARD("the Surveyor 1 lunar lander: a triangular three-legged aluminium frame with a tall mast, a flat square solar panel and a small dish", "grey lunar regolith with small craters"),
  "card-apollo": CARD("the descent stage of the Apollo Lunar Module: an octagonal body wrapped in gold foil on four splayed legs with round footpads and a ladder", "grey lunar regolith with bootprints"),
  "card-lrv": CARD("the Apollo Lunar Roving Vehicle: an open four-wheeled buggy with wire-mesh wheels, two seats and an umbrella-shaped dish antenna", "grey lunar regolith with tyre tracks"),
  "card-ranger": `Museum exhibit photograph of the Ranger 7 lunar probe: a hexagonal frame with two flat rectangular solar panels, a tall conical camera housing and a dish antenna, floating freely in three-quarter view. Isolated on a pure white seamless background with a soft faint shadow beneath, the entire spacecraft in frame with generous margin, centred, soft natural daylight, photorealistic, high detail. No text, no logos, no insignia, no flags.`,
  "card-lcross": `Museum exhibit photograph of the LCROSS spacecraft: a ring-shaped shepherding spacecraft with instruments and solar panel, attached to a long silver Centaur rocket stage, floating freely in three-quarter view. Isolated on a pure white seamless background with a soft faint shadow beneath, the entire spacecraft in frame with generous margin, centred, soft natural daylight, photorealistic, high detail. No text, no logos, no insignia, no flags.`,
  "card-grail": `Museum exhibit photograph of the twin GRAIL spacecraft Ebb and Flow: two small identical box-shaped gold-foil spacecraft, each with two flat solar panels, flying one behind the other in three-quarter view. Isolated on a pure white seamless background with a soft faint shadow beneath, both spacecraft fully in frame with generous margin, centred, soft natural daylight, photorealistic, high detail. No text, no logos, no insignia, no flags.`,
  "card-pathfinder": CARD("the Mars Pathfinder lander with three open triangular petals draped in deflated white airbags, and the tiny six-wheeled Sojourner rover beside it"),
  "hero-opportunity": `Wide cinematic shot of a six-wheeled NASA Mars Exploration Rover (Opportunity) with tall camera mast and flat solar panels, ${MARS}, low sun at dusk, purple-violet twilight sky, dramatic.`,
  opportunity: `Six-wheeled Mars Exploration Rover Opportunity with tall camera mast, flat solar panel deck and high-gain dish antenna, three-quarter view, ${MARS}.`,
  spirit: `Six-wheeled Mars Exploration Rover Spirit, dusty solar panels, tall camera mast, side view, ${MARS}, Gusev crater hills in background.`,
  "viking-1": `Viking 1 Mars lander: three-legged hexagonal lander body with dish antenna and sampling arm, white and grey, ${MARS}, rocky Chryse Planitia.`,
  "viking-2": `Viking 2 Mars lander, three-legged lander with dish antenna, tilted slightly, frost on the ground, ${MARS}, Utopia Planitia boulders.`,
  ingenuity: `Ingenuity Mars helicopter: small cube body with two stacked coaxial rotors and four thin legs, hovering low, ${MARS}.`,
  sojourner: `Sojourner, a tiny six-wheeled microwave-oven-sized Mars rover with a flat solar panel top, next to a rock, ${MARS}.`,
  insight: `InSight Mars lander with two large round fan-shaped solar arrays and a robotic arm, seismometer dome on the ground, ${MARS}, flat Elysium Planitia.`,
  phoenix: `Phoenix Mars lander with two round decagonal solar arrays and robotic arm digging, arctic Mars plains with polygon cracks and white ice, ${MARS}.`,
  "story-storm": `Opportunity Mars rover alone on a ridge as a towering planet-wide orange dust storm rolls in, dim sun disc through dust, ${MARS}, moody, wide landscape.`,
  "mars-globe": "The planet Mars as a full sphere, centered, isolated on a pure white background, realistic surface detail, craters and dark regions, soft lighting.",
  "moon-globe": "The Moon as a full sphere, centered, isolated on a pure white background, realistic grey surface with craters and maria, soft lighting.",
  landing: `Mars rover landing inside inflated white airbag cluster bouncing on the surface, dust kicked up, ${MARS}.`,
  launch: "Delta II rocket with white and blue body lifting off from a launch pad at night, bright exhaust plume, clouds of steam, Cape Canaveral, no text.",
  assembly: "Engineers in white cleanroom bunny suits assembling a six-wheeled Mars rover in a bright spacecraft cleanroom, faces covered by masks, no logos.",
  route: `Top-down orbital satellite view of a Mars plain with several impact craters of different sizes, ${MARS}, map-like, no labels.`,
  crater: `Large impact crater seen from its rim, layered rock walls, ${MARS}, vast and quiet.`,
  ranger: `Ranger 7 spacecraft: small probe with two flat solar panels and a cone-shaped camera, flying above ${MOON}.`,
  surveyor: `Surveyor 1 lunar lander: three-legged triangular frame with a tall mast and flat solar panel, ${MOON}.`,
  apollo: `Apollo Lunar Module descent stage with gold foil and four legs standing ${MOON}, footprints in the dust.`,
  lrv: `Apollo Lunar Roving Vehicle, open four-wheeled buggy with mesh wheels and an umbrella antenna, parked ${MOON}.`,
  lcross: `LCROSS spacecraft attached to a spent Centaur rocket stage, flying toward the dark south pole of the Moon, ${MOON}.`,
  grail: "Two small twin GRAIL spacecraft with solar panels flying in tandem over the grey cratered Moon, black space.",
  tracks: `Rover wheel tracks leading across the dusty ground toward the horizon, low dusty light, ${MARS}.`,
  "polar-lander": `Mars Polar Lander, three-legged lander with two solar panels, near the layered south polar ice cap, ${MARS}.`,
  "icon-touchdown": "Square game app icon for a space game called Touchdown: a small gold-foil four-legged lander descending on a bright engine flame toward a glowing cyan landing ring on rusty Mars ground, a tall violet light beam rising from the ground in the distance, deep violet-to-black starry sky, curved planet horizon. Bold, simple, centred composition that reads well at small sizes, rich cinematic lighting, polished digital illustration, soft glow. No text, no letters, no logos, no insignia, no flags, no border.",
  "hero-mars": "Wide empty Martian plain in soft bright light, a pale hazy butterscotch sky filling the upper half, gentle low hills on the far horizon, fine orange dust and a few scattered rocks in the foreground, airy and light, soft low contrast, calm, lots of open space. No machines, no rovers, no spacecraft.",
  "hero-moon": "Wide empty lunar surface in bright sunlight, pale grey regolith with small craters and a few rocks in the foreground, gentle rolling grey hills on the far horizon, the sky a soft pale grey-white haze instead of black, airy and light, soft low contrast, calm, lots of open space. No machines, no landers, no astronauts, no footprints.",
  "hero-scrapbook": "Wide website hero artwork in a playful scrapbook collage style on warm off-white paper texture, bright and airy. A large photoreal six-wheeled Mars rover with a tall camera mast and flat solar panels stands in the centre-right on a small patch of orange Martian dust, slightly cut out like a sticker with a soft shadow. Around it, a scattered collage: two or three taped polaroid photographs of the orange Martian surface and the grey cratered Moon, a vintage postage stamp illustration of a gold-foil lunar module with serrated edges, a torn paper ticket stub, strips of washi tape, small hand-drawn pencil arrows, dotted orbit lines and tiny planet doodles. The whole top-left third of the image is left as clean empty paper for a headline. Absolutely no text, no letters, no numbers, no writing anywhere.",
  "hero-selfie": "A warm, joyful group selfie of old space robots, photographed from the selfie-taker's point of view with a slight wide-angle lens, on a PURE WHITE seamless studio background with soft shadows, everything crowded into the middle of the frame with clean white space all around the edges. In front, an accurate NASA Mars Exploration Rover (Opportunity): six wheels on a rocker-bogie suspension, a flat triangular deck of solar panels, a tall white camera mast topped by a box with two small round camera lenses, stretching its short jointed robotic arm toward the viewer like a selfie stick. Crowding in behind it, each accurately modelled: its identical twin rover Spirit leaning in; the tiny six-wheeled Sojourner rover in the front, knee-high; a Viking lander on three legs with a large white dish antenna; the Phoenix lander with two round twelve-sided solar panels and a robotic arm; the InSight lander with two round solar panels, an arm and a small grey dome on the ground; the Apollo lunar module DESCENT STAGE only, a squat gold-foil octagonal base on four spindly legs with footpads and a ladder; the Apollo Lunar Roving Vehicle, an open four-wheeled buggy with wire-mesh wheels, two seats and a mesh umbrella antenna; and the Ingenuity helicopter, a small box with two stacked long rotor blades and four thin legs, hovering at the top peeking in. Rovers and landers on a few small patches of orange Mars dust and grey Moon dust. Bright, clean, wholesome and a little funny.",
  pathfinder: `Mars Pathfinder lander with three open triangular petals covered in deflated airbags, small rover nearby, ${MARS}, Ares Vallis rocks.`,
};

async function generate(name, prompt) {
  const file = `${OUT}/${name}.${name.startsWith("card-") ? "webp" : "jpg"}`;
  if (existsSync(file)) return console.log(`skip  ${name} (exists)`), 0;

  const before = await spentSoFar();
  const res = await fetch("https://openrouter.ai/api/v1/images", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt: name.startsWith("card-") ? prompt : `${prompt} ${STYLE}`,
      quality: "low",
      // Hero backdrops are wide; everything else uses the model's default square.
      ...(name.startsWith("hero-") ? { size: "1536x1024" } : {}),
      n: 1,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${name}: ${res.status} ${JSON.stringify(json).slice(0, 400)}`);

  const item = json.data?.[0];
  const cost = json.usage?.cost ?? (await spentSoFar()) - before;
  appendFileSync(LEDGER, `${new Date().toISOString()} ${name} $${cost} ${JSON.stringify(json.usage ?? {})}\n`);
  if (!item?.b64_json && !item?.url) throw new Error(`${name}: no image in response ${JSON.stringify(json).slice(0, 400)}`);

  const png = `${OUT}/${name}.png`;
  const bytes = item.b64_json
    ? Buffer.from(item.b64_json, "base64")
    : Buffer.from(await (await fetch(item.url)).arrayBuffer());
  writeFileSync(png, bytes);
  if (name.startsWith("card-")) {
    // Keep the untouched original so the crop can be redone without paying again.
    writeFileSync(`${RAW}/${name}.png`, bytes);
    await trimCard(png, file);
    execFileSync("rm", [png]);
    console.log(`made  ${name}  $${cost}`);
    return cost;
  }
  // Re-encode as a compact JPEG for the web.
  execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "78", png, "--out", file], { stdio: "ignore" });
  execFileSync("rm", [png]);
  console.log(`made  ${name}  $${cost}`);
  return cost;
}

/**
 * Turns a card cut-out into a transparent WebP: crops to the machine and its ground, then
 * removes the white background with colour-to-alpha, so soft edges and shadows stay smooth
 * on any card colour.
 */
export async function trimCard(src, out) {
  const sharp = (await import("sharp")).default;
  const trimmed = await sharp(src).flatten({ background: "#ffffff" }).trim({ background: "#ffffff", threshold: 22 }).toBuffer();
  const { data, info } = await sharp(trimmed).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, o = 0; i < data.length; i += ch, o += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // Alpha is how far the darkest channel sits from white; near-white noise becomes clear.
    let a = (255 - Math.min(r, g, b)) / 255;
    a = a < 0.04 ? 0 : Math.min(1, (a - 0.04) / 0.96);
    if (a === 0) continue;
    const un = (c) => Math.max(0, Math.min(255, Math.round((c - 255 * (1 - a)) / a)));
    rgba[o] = un(r); rgba[o + 1] = un(g); rgba[o + 2] = un(b); rgba[o + 3] = Math.round(a * 255);
  }
  const pad = Math.round(Math.max(info.width, info.height) * 0.03);
  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(out);
}

async function spentSoFar() {
  const r = await fetch("https://openrouter.ai/api/v1/key", { headers: { Authorization: `Bearer ${KEY}` } });
  const { data } = await r.json();
  return data.usage;
}

mkdirSync(RAW, { recursive: true });
if (process.argv[2] === "--recrop") {
  for (const f of readdirSync(RAW).filter((f) => f.startsWith("card-") && f.endsWith(".png"))) {
    await trimCard(`${RAW}/${f}`, `${OUT}/${f.replace(".png", ".webp")}`);
    console.log(`recropped ${f}`);
  }
  process.exit(0);
}
const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(ASSETS);
let spent = await spentSoFar();
console.log(`spent so far: $${spent.toFixed(4)} / budget $${BUDGET}`);
for (const name of names) {
  if (!ASSETS[name]) throw new Error(`unknown asset ${name}`);
  if (spent + 0.03 > BUDGET) {
    console.log(`stop: budget reached ($${spent.toFixed(4)})`);
    break;
  }
  spent += await generate(name, ASSETS[name]);
}
console.log(`done. spent: $${(await spentSoFar()).toFixed(4)}`);
