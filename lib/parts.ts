/**
 * Parts explorer data for each hero's 3D model (app/components/profile/model-studio.tsx).
 * Built models (lib/models/procedural.ts) match parts by group id; NASA models match by node
 * name (`nodes`) or, where the file has no named parts, by a marker position (`at`, a fraction of
 * the model's box). Descriptions only restate what the hero's listed sources say.
 */
import type { StudioPart } from "@/app/components/profile/model-studio";

const D3 = (slug: string) => `https://science.nasa.gov/3d-resources/${slug}/`;

export const PARTS: Record<string, StudioPart[]> = {
  "ranger-7": [
    { id: "cameras", label: "Six TV cameras", text: "Six television cameras that sent pictures home in the last minutes before impact." },
    { id: "tower", label: "Camera tower", text: "Held the TV cameras." },
    { id: "omni", label: "Omni antenna" },
    { id: "solar", label: "Solar panels" },
    { id: "hga", label: "High-gain dish", text: "Sent the pictures to NASA's Goldstone antenna in California." },
    { id: "base", label: "Hexagonal bus" },
    { id: "motor", label: "Mid-course motor", text: "Fired for a course correction on 29 July 1964." },
  ],
  "surveyor-1": [
    { id: "camera", label: "TV camera", text: "Its single TV camera sent back 11,240 pictures by 6 July 1966." },
    { id: "array", label: "Solar panel and planar antenna", text: "Mounted on the central mast to catch sunlight and point at Earth." },
    { id: "mast", label: "Antenna mast" },
    { id: "compartments", label: "Thermal compartments", text: "Insulated boxes that kept the electronics alive through the cold." },
    { id: "frame", label: "Triangular frame", text: "A thin-walled aluminium triangle weighing 27 kg." },
    { id: "verniers", label: "Vernier engines", text: "Small engines that steered the final descent; the large solid retro-rocket in the centre made up over 60% of the launch mass." },
    { id: "legs", label: "Three landing legs", text: "One leg at each corner of the triangle. The landing proved the lunar ground could hold a lander." },
    { id: "omni", label: "Omni antennas" },
  ],
  "apollo-11-lander": [
    { id: "ascent", label: "Ascent stage", text: "The crew cabin with its own engine. It lifted off on 21 July 1969 and left the descent stage behind.", at: [0, 0.23, 0] },
    { id: "sband", label: "Steerable S-band antenna", text: "Carried voice, data and television between the lander and Earth.", at: [-0.21, 0.33, -0.05] },
    { id: "rcs", label: "Thruster quads", text: "Clusters of small rockets that turned and steadied the lander.", at: [-0.19, 0.17, -0.2] },
    { id: "descent", label: "Descent stage", text: "The landing stage with fuel, legs and the descent engine. It is still at Tranquility Base.", at: [0, -0.18, 0] },
    { id: "ladder", label: "Ladder and front leg", text: "The ladder the crew climbed down. A plaque was fixed to this leg.", at: [0, -0.25, 0.42] },
    { id: "engine", label: "Descent engine", text: "The throttleable engine that slowed the landing.", at: [0, -0.44, 0] },
    { id: "legs", label: "Landing legs", text: "Four legs with round footpads.", at: [-0.43, -0.44, 0] },
  ],
  "apollo-15-rover": [
    { id: "camera", label: "TV camera (GCTA)", text: "Controlled from Earth; it broadcast the crew's liftoff on 2 August 1971." },
    { id: "hga", label: "High-gain antenna", text: "An umbrella-like dish that sent television straight to Earth." },
    { id: "lcru", label: "Communications relay (LCRU)", text: "Linked the astronauts and the camera with Earth." },
    { id: "lga", label: "Low-gain antenna" },
    { id: "console", label: "Control console and hand controller" },
    { id: "seats", label: "Two seats" },
    { id: "chassis", label: "Chassis and batteries" },
    { id: "wheels", label: "Wire-mesh wheels" },
    { id: "fenders", label: "Fenders" },
    { id: "pallet", label: "Tool and sample pallet" },
  ],
  "viking-1": [],
  "viking-2": [],
  "pathfinder-sojourner": [
    { id: "imp", label: "Pop-up camera mast (IMP)", text: "The Imager for Mars Pathfinder, which took the lander's panoramas." },
    { id: "sojourner", label: "Sojourner rover", text: "About 30 cm tall. It talked to Earth through the lander and drove down a ramp on 5 July 1997." },
    { id: "petals", label: "Solar petals", text: "Three petals opened after landing to set the lander upright and expose its solar cells." },
    { id: "ramps", label: "Rover ramps", text: "Sojourner rolled down the rear ramp, tilted 20 degrees." },
    { id: "airbags", label: "Deflated airbags", text: "The lander bounced about 15 times inside them before coming to rest." },
    { id: "hga", label: "High-gain antenna" },
    { id: "met", label: "Weather mast (ASI/MET)" },
    { id: "base", label: "Base petal and electronics" },
  ],
  "mars-polar-lander": [
    { id: "camera", label: "Stereo camera mast (SSI)" },
    { id: "arm", label: "Robotic arm and scoop", text: "Meant to dig into the soil near the south polar layered terrain." },
    { id: "arrays", label: "Fixed solar arrays" },
    { id: "met", label: "Weather mast" },
    { id: "lab", label: "Gas analyser (TEGA)" },
    { id: "lidar", label: "LIDAR" },
    { id: "deck", label: "Instrument deck" },
    { id: "thrusters", label: "Descent engines", text: "An investigation found that a false touchdown signal most likely shut them down early, and the lander crashed." },
    { id: "legs", label: "Three landing legs" },
  ],
  phoenix: [
    { id: "camera", label: "Stereo camera on a 2 m mast (SSI)", text: "Its two eyes gave a high-resolution 3D view of the landing site." },
    { id: "arm", label: "Robotic arm (2.35 m) and scoop", text: "Dug the trenches where bright material turned out to be water ice." },
    { id: "arrays", label: "Two round UltraFlex solar arrays", text: "Unfurled 15 minutes after landing, once the dust settled. As winter came, the Sun sank too low to power the lander." },
    { id: "met", label: "Weather station mast and telltale" },
    { id: "lab", label: "Ovens and wet chemistry lab (TEGA, MECA)", text: "Tiny ovens and a portable laboratory analysed soil the arm collected." },
    { id: "lidar", label: "LIDAR" },
    { id: "deck", label: "Instrument deck" },
    { id: "thrusters", label: "Descent thrusters" },
    { id: "legs", label: "Three landing legs" },
  ],
  spirit: [],
  opportunity: [],
  lcross: [
    { id: "instruments", label: "Cameras and spectrometers", text: "Visible, near- and mid-infrared cameras and spectrometers that watched the Centaur's impact plume." },
    { id: "solar", label: "Solar array" },
    { id: "antennas", label: "Medium-gain antennas" },
    { id: "avionics", label: "Avionics panels" },
    { id: "tank", label: "Propellant tank" },
    { id: "ring", label: "Ring structure" },
  ],
  grail: [
    { id: "ebb", label: "Ebb (GRAIL-A)", text: "One of the twin spacecraft that flew in tandem around the Moon." },
    { id: "flow", label: "Flow (GRAIL-B)" },
    { id: "link", label: "Link between the twins", text: "Flying in tandem, the twins mapped variations in the Moon's gravity field." },
  ],
  insight: [
    { id: "seis", label: "Seismometer (SEIS)", text: "Placed on the ground by the arm; it recorded 1,319 marsquakes.", nodes: ["SEIS"] },
    { id: "wts", label: "Wind and thermal shield", text: "The dome that covered the seismometer.", nodes: ["WTS"] },
    { id: "hp3", label: "Heat probe (HP3, 'the mole')", nodes: ["HP3_v3d_baked"] },
    { id: "arm", label: "Robotic arm, scoop and camera", text: "Over 1.8 m long. It lifted the seismometer and heat-flow probe off the deck and placed them on the surface.", nodes: ["arm_01"] },
    { id: "arrays", label: "Solar arrays", text: "Dust slowly covered them until there was not enough power to go on.", nodes: ["panel_l_root", "panel_l_rod", "panel_r_root", "panel_r_rod"] },
    { id: "rise", label: "Radio antennas (RISE)", nodes: ["RISE_antennas"] },
    { id: "twins", label: "Weather sensors (TWINS)", nodes: ["TWINS"] },
    { id: "uhf", label: "UHF antenna", nodes: ["UHF_antenna"] },
    { id: "icc", label: "Context camera", nodes: ["ICC"] },
    { id: "legs", label: "Landing legs", nodes: ["leg_b", "leg_l", "leg_r"] },
  ],
  ingenuity: [
    { id: "rotors", label: "Two counter-rotating rotors", text: "About 1.2 m tip to tip, built to fly in an atmosphere less than 1 percent as dense as Earth's.", nodes: ["rotors_01", "rotors_02", "parts_01", "parts_02"] },
    { id: "solar", label: "Solar panel", text: "Charged its batteries between flights.", nodes: ["solar_panel"] },
    { id: "bus", label: "Fuselage", text: "The box holding batteries, computers and sensors.", nodes: ["bus"] },
    { id: "cams", label: "Cameras", nodes: ["cams"] },
    { id: "legs", label: "Four legs", nodes: ["leg_01", "leg_02", "leg_03", "leg_04"] },
  ],
};

const VIKING: StudioPart[] = [
  { id: "hga", label: "High-gain antenna", at: [-0.31, 0.38, 0.08] },
  { id: "cameras", label: "Two cameras", text: "Two facsimile cameras.", at: [-0.04, 0.12, 0.05] },
  { id: "arm", label: "Sampler arm", text: "Scooped up soil samples for the biology laboratory inside.", at: [0.3, -0.15, 0] },
  { id: "met", label: "Weather boom", at: [-0.19, 0.25, -0.42] },
  { id: "body", label: "Body and science lab", text: "Held the biological laboratory, gas chromatograph mass spectrometer, X-ray fluorescence spectrometer and seismometer.", at: [0, 0, 0] },
  { id: "legs", label: "Three landing legs", at: [-0.44, -0.47, 0] },
];
PARTS["viking-1"] = VIKING;
PARTS["viking-2"] = VIKING;

const MER: StudioPart[] = [
  { id: "mast", label: "Camera mast (Pancam, Navcam)", text: "Cameras about 1.5 m off the ground giving 360-degree stereo views; the Mini-TES spectrometer looked out through it.", at: [0, 0.41, -0.12] },
  { id: "arm", label: "Robotic arm (IDD)", text: "Carried a microscope, two spectrometers, magnets and the rock abrasion tool, which it pressed against rocks and soil.", at: [0, -0.24, 0.46] },
  { id: "hga", label: "High-gain antenna", at: [0.19, 0.01, -0.37] },
  { id: "solar", label: "Solar arrays", text: "Its only power source. Wind sometimes swept them clean of dust.", at: [-0.3, -0.09, -0.25] },
  { id: "body", label: "Warm electronics box", at: [0, -0.23, -0.1] },
  { id: "wheels", label: "Six wheels, rocker-bogie suspension", at: [-0.41, -0.43, -0.21] },
];
PARTS.spirit = MER;
PARTS.opportunity = MER;

/** Related files on NASA 3D Resources: printable sites, source files, other configurations. */
export const DOWNLOADS: Record<string, { label: string; url: string }[]> = {
  "apollo-11-lander": [{ label: "Apollo 11 landing site, 3D print (NASA)", url: D3("apollo-11-landing-site") }],
  "apollo-15-rover": [
    { label: "Apollo 15 landing site, 3D print (NASA)", url: D3("apollo-15-landing-site") },
    { label: "Mount Hadley, 3D print (NASA)", url: D3("moon-mount-hadley") },
  ],
  "viking-1": [{ label: "Printable Viking lander kit (NASA)", url: D3("viking-lander-2") }],
  "viking-2": [{ label: "Printable Viking lander kit (NASA)", url: D3("viking-lander-2") }],
  spirit: [
    { label: "Spirit's landing site, 3D print (NASA)", url: D3("mars-spirit-landing-site") },
    { label: "Spirit's drive path, 3D print (NASA)", url: D3("mars-spirit-rover-path") },
    { label: "Rover source file, Blender (NASA)", url: D3("mars-exploration-rover-spirit-and-opportunity") },
  ],
  opportunity: [
    { label: "Victoria crater, 3D print (NASA)", url: D3("mars-trek-victoria-crater") },
    { label: "Rover source file, Blender (NASA)", url: D3("mars-exploration-rover-spirit-and-opportunity") },
  ],
  insight: [{ label: "Other InSight configurations (NASA)", url: D3("insight-cruise-lander") }],
  ingenuity: [{ label: "Ingenuity on NASA 3D Resources", url: D3("ingenuity-mars-helicopter") }],
};
