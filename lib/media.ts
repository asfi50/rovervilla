/**
 * Watch, read and fly along: official videos (YouTube, checked against each channel with YouTube's
 * oEmbed lookup), NASA articles about each machine, and its NASA Eyes on the Solar System view.
 */

export type Video = { id: string; title: string; channel: string };
export type NewsLink = { title: string; url: string; site: string };

export const VIDEOS: Record<string, Video[]> = {
  "ranger-7": [
    { id: "5Z7GGiXRAo0", title: "Ranger 7 'Meets' the Moon", channel: "NASA Jet Propulsion Laboratory" },
    { id: "hpFifHgZyrg", title: "Ranger Spacecraft Impact on Moon", channel: "Smithsonian National Air and Space Museum" },
    { id: "bIFHcWvUWiA", title: "The launch of Ranger 7 and its impact on the Moon, July 28, 1964.", channel: "Cosmosphere" },
  ],
  "surveyor-1": [
    { id: "FOWNrvvTIZM", title: "America’s First Lunar Surveyor: 50 Years Later", channel: "NASA Jet Propulsion Laboratory" },
    { id: "muqhpjQhEIs", title: "Animation of Surveyor 1's soft landing on the Moon, June 2, 1966 | NASA Archives", channel: "Cosmosphere" },
    { id: "kiK8_cgTX2I", title: "The launch of Surveyor 1, May 30, 1966 | NASA Archives", channel: "Cosmosphere" },
  ],
  "apollo-11-lander": [
    { id: "FlpstXNjImY", title: "Historic Apollo 11 Moon Landing Footage", channel: "NASA" },
    { id: "iR3oXFFISI0", title: "Historic Apollo 11 Moonwalk Footage", channel: "NASA" },
  ],
  "apollo-15-rover": [
    { id: "1Mqsd0ru_pc", title: "Apollo 15: \"Never Been on a Ride like this Before\"", channel: "NASA" },
    { id: "26oQ3m5EHrg", title: "Spacecraft with Wheels: The Lunar Roving Vehicle (archival film)", channel: "NASA's Marshall Space Flight Center" },
    { id: "Rj1O-VD_iL4", title: "Apollo 15 astronauts David Scott and James Irwin deploy the Lunar Rover on the Moon, 1971.", channel: "Cosmosphere" },
  ],
  "viking-1": [
    { id: "uhpQ670XGaM", title: "Viking 40th Anniversary", channel: "NASA" },
    { id: "QehAkQEa44g", title: "NASA's video of the Viking Project, the First U.S. Mars Landing, 1976 | NASA Archives", channel: "Cosmosphere" },
    { id: "WezyH0wrnDI", title: "Animation depicting Viking 1's Mars landing and mission team reaction, July 20, 1976.", channel: "Cosmosphere" },
  ],
  "viking-2": [
    { id: "uhpQ670XGaM", title: "Viking 40th Anniversary", channel: "NASA" },
    { id: "QehAkQEa44g", title: "NASA's video of the Viking Project, the First U.S. Mars Landing, 1976 | NASA Archives", channel: "Cosmosphere" },
  ],
  "pathfinder-sojourner": [
    { id: "XvVOgS9jWn0", title: "Mars Pathfinder - 20th Anniversary Special", channel: "NASA Jet Propulsion Laboratory" },
    { id: "1rVH0YlcKyY", title: "JPL and the Space Age: The Pathfinders", channel: "NASA Jet Propulsion Laboratory" },
  ],
  "mars-polar-lander": [
    { id: "xyMKBHnc1U8", title: "Mars Polar Lander - 1999 | Today In History | 3 Dec 18", channel: "AP Archive" },
    { id: "FLDNiSjyCOc", title: "USA:  NASA UNABLE TO DETECT MARS POLAR LANDER SIGNAL", channel: "AP Archive" },
  ],
  "spirit": [
    { id: "EIr03Cz-3zc", title: "Spirit & Opportunity: Celebrating Five Years on Mars", channel: "NASA Jet Propulsion Laboratory" },
    { id: "sZ71zKj0MvA", title: "Spirit Knocked, Opportunity Rocked: 20 Years of Rovers on Mars (Live Public Talk)", channel: "NASA Jet Propulsion Laboratory" },
  ],
  "opportunity": [
    { id: "1Ll-VHYxWXU", title: "Opportunity: NASA Rover Completes Mars Mission", channel: "NASA Jet Propulsion Laboratory" },
    { id: "mszQH8URWoU", title: "Farewell Opportunity", channel: "NASA 360" },
    { id: "JC70jJgQJyM", title: "Video file: Mars Opportunity Rover Mission is Complete", channel: "JPLraw" },
  ],
  "phoenix": [
    { id: "hH5pNFROlYU", title: "Phoenix Mars Landing: Nerves and Joy", channel: "NASA Jet Propulsion Laboratory" },
    { id: "yfokc0xdKJU", title: "JPL Video: Phoenix Mars Lander: Hunting for Habitats", channel: "NASA Jet Propulsion Laboratory" },
    { id: "p31kJNvEu5k", title: "Real World: Farewell to the Mars Phoenix Lander", channel: "NASA eClips - ARCHIVE" },
  ],
  "lcross": [
    { id: "VVYKjR1sJY4", title: "LCROSS Lunar Impact", channel: "NASA" },
    { id: "eG0APKeWjIA", title: "NASA SELECTS TARGET CRATER FOR LUNAR IMPACT OF LCROSS SPACECRAFT", channel: "NASA" },
  ],
  "grail": [
    { id: "TY_snIUoE5c", title: "NASA Grail Twins Make Impact with Moon", channel: "NASA" },
    { id: "geWg8mt-Hkg", title: "GRAIL Mission Returns First Video of Moon's Far Side", channel: "NASA Jet Propulsion Laboratory" },
    { id: "BydwotEx3WQ", title: "GRAIL Primary Mission Gravity Maps", channel: "NASA Scientific Visualization Studio" },
    { id: "PODCa9sA34A", title: "Parting Moon Shots from NASA's GRAIL mission", channel: "NASA Jet Propulsion Laboratory" },
  ],
  "insight": [
    { id: "RVzzgwVyH4Y", title: "NASA Lands InSight on Mars", channel: "NASA Jet Propulsion Laboratory" },
    { id: "m9cCuW9nIQg", title: "Listen to NASA's InSight at Work on Mars", channel: "NASA Jet Propulsion Laboratory" },
    { id: "bGD_YF64Nwk", title: "Mission Control Live: NASA InSight Mars Landing", channel: "NASA Jet Propulsion Laboratory" },
  ],
  "ingenuity": [
    { id: "wMnOo2zcjXA", title: "First Video of NASA’s Ingenuity Mars Helicopter in Flight, Includes Takeoff and Landing (High-Res)", channel: "NASA Jet Propulsion Laboratory" },
    { id: "raOA2MX-XLQ", title: "#ThanksIngenuity – NASA’s Mars Helicopter Team Says Goodbye", channel: "NASA Jet Propulsion Laboratory" },
    { id: "w_Y3rtH_WUg", title: "The Most Extreme Flights of NASA’s Ingenuity Mars Helicopter (Mars Report)", channel: "NASA Jet Propulsion Laboratory" },
  ],
};

export const NEWS: Record<string, NewsLink[]> = {
  "ranger-7": [
    { title: "60 Years Ago: Ranger 7 Photographs the Moon", url: "https://www.nasa.gov/history/60-years-ago-ranger-7-photographs-the-moon/", site: "NASA" },
    { title: "First Image of the Moon Taken by a U.S. Spacecraft", url: "https://www.nasa.gov/image-article/first-image-of-moon-taken-by-u-s-spacecraft/", site: "NASA" },
    { title: "The Jet Propulsion Laboratory’s Apollo Connection", url: "https://www.nasa.gov/missions/apollo/apollo-11/the-jet-propulsion-laboratorys-apollo-connection/", site: "NASA" },
  ],
  "surveyor-1": [
    { title: "55 Years Ago: Surveyor 1 Makes A Soft Landing on the Moon", url: "https://www.nasa.gov/history/55-years-ago-surveyor-1-makes-a-soft-landing-on-the-moon/", site: "NASA" },
    { title: "May 30, 1966, Surveyor 1 Launch", url: "https://www.nasa.gov/image-article/may-30-1966-surveyor-1-launch/", site: "NASA" },
    { title: "Shadow of Surveyor 1 on the Moon", url: "https://www.nasa.gov/image-article/shadow-of-surveyor-1-moon/", site: "NASA" },
  ],
  "apollo-11-lander": [
    { title: "The Eagle Prepares to Land", url: "https://www.nasa.gov/image-article/eagle-prepares-land/", site: "NASA" },
    { title: "Aldrin Descends Lunar Module Ladder", url: "https://www.nasa.gov/image-article/aldrin-descends-lunar-module-ladder/", site: "NASA" },
    { title: "Launch of Apollo 11", url: "https://www.nasa.gov/image-article/launch-of-apollo-11/", site: "NASA" },
  ],
  "apollo-15-rover": [
    { title: "First Use of the Lunar Roving Vehicle – July 31, 1971", url: "https://www.nasa.gov/image-article/this-week-nasa-history-first-use-of-lunar-roving-vehicle-july-31-1971/", site: "NASA" },
    { title: "Apollo 15 Astronauts Deploy First Lunar Roving Vehicle", url: "https://www.nasa.gov/image-article/this-week-nasa-history-apollo-15-astronauts-deploy-first-lunar-roving-vehicle-july-31-1971/", site: "NASA" },
    { title: "50 Years Ago, First Apollo Astronauts to Drive on the Moon Took Final Cruise", url: "https://www.nasa.gov/history/50-years-ago-first-apollo-astronauts-to-drive-on-the-moon-took-final-cruise/", site: "NASA" },
  ],
  "viking-1": [
    { title: "45 years ago: Viking 1 Touches Down on Mars", url: "https://www.nasa.gov/history/45-years-ago-viking-1-touches-down-on-mars/", site: "NASA" },
    { title: "Our First View of the Surface of Mars", url: "https://www.nasa.gov/image-article/our-first-view-of-the-surface-of-mars/", site: "NASA" },
    { title: "45 Years Ago: Viking 1 and 2 off to Mars", url: "https://www.nasa.gov/history/45-years-ago-viking-1-and-2-off-to-mars/", site: "NASA" },
  ],
  "viking-2": [
    { title: "September 1975 – Viking 2 Launched", url: "https://www.nasa.gov/image-article/september-1975-viking-2-launched/", site: "NASA" },
    { title: "NASA Langley 100: Sojourning to Mars", url: "https://www.nasa.gov/centers-and-facilities/langley/nasalangley100-sojourning-to-mars/", site: "NASA" },
    { title: "45 Years Ago: Viking 1 and 2 off to Mars", url: "https://www.nasa.gov/history/45-years-ago-viking-1-and-2-off-to-mars/", site: "NASA" },
  ],
  "pathfinder-sojourner": [
    { title: "25 Years Ago: Mars Pathfinder Launches to Mars to Deploy Sojourner, the First Planetary Rover", url: "https://www.nasa.gov/history/25-years-ago-mars-pathfinder-launches-to-mars-to-deploy-sojourner-the-first-planetary-rover-2/", site: "NASA" },
    { title: "July 4, 1997: Sojourner Arrives on the Red Planet", url: "https://www.nasa.gov/image-article/july-4-1997-sojourner-arrives-red-planet/", site: "NASA" },
    { title: "Pathfinder and Sojourner: 10 Years Later", url: "https://www.nasa.gov/image-article/pathfinder-sojourner-10-years-later/", site: "NASA" },
    { title: "NASA Glenn Had Key Role in NASA’s 1997 Return to Mars", url: "https://www.nasa.gov/history/nasa-glenn-had-key-role-in-nasas-1997-return-to-mars-2/", site: "NASA" },
  ],
  "mars-polar-lander": [
    { title: "25 Years of Continuous Robotic Mars Exploration – From Pathfinder to Perseverance", url: "https://www.nasa.gov/history/25-years-of-continuous-robotic-mars-exploration-from-pathfinder-to-perseverance/", site: "NASA" },
  ],
  "spirit": [
    { title: "NASA Celebrates Decade of Mars Exploration by Spirit, Opportunity", url: "https://www.nasa.gov/missions/mer/nasa-celebrates-decade-of-mars-exploration-by-spirit-opportunity/", site: "NASA" },
    { title: "Spirit Embedded in Soft Soil on Mars as Engineers Devise Methods to ‘Free Spirit’", url: "https://www.nasa.gov/image-article/spirit-embedded-soft-soil-mars-as-engineers-devise-methods-free-spirit/", site: "NASA" },
    { title: "Ten Years Ago, Spirit Rover Lands on Mars", url: "https://www.nasa.gov/image-article/ten-years-ago-spirit-rover-lands-mars/", site: "NASA" },
    { title: "Spirit Rover Still Shining", url: "https://www.nasa.gov/image-article/spirit-rover-still-shining/", site: "NASA" },
  ],
  "opportunity": [
    { title: "NASA’s Record-Setting Opportunity Rover Mission on Mars Comes to End", url: "https://www.nasa.gov/news-release/nasas-record-setting-opportunity-rover-mission-on-mars-comes-to-end/", site: "NASA" },
    { title: "NASA to Share Results of Effort to Recover Mars Opportunity Rover", url: "https://www.nasa.gov/news-release/nasa-to-share-results-of-effort-to-recover-mars-opportunity-rover/", site: "NASA" },
    { title: "Opportunity’s Final Traverse Map", url: "https://www.nasa.gov/image-article/opportunitys-final-traverse-map/", site: "NASA" },
    { title: "Shades of Martian Darkness", url: "https://www.nasa.gov/image-article/shades-of-martian-darkness/", site: "NASA" },
  ],
  "phoenix": [
    { title: "Phoenix Looks Around", url: "https://www.nasa.gov/image-article/phoenix-looks-around/", site: "NASA" },
    { title: "Phoenix Twilight", url: "https://www.nasa.gov/image-article/phoenix-twilight/", site: "NASA" },
  ],
  "lcross": [
    { title: "What is LCROSS, the Lunar Crater Observation and Sensing Satellite?", url: "https://www.nasa.gov/general/what-is-lcross-the-lunar-crater-observation-and-sensing-satellite/", site: "NASA" },
    { title: "NASA’s LCROSS Satellite to Impact the Moon Oct. 9", url: "https://www.nasa.gov/news-release/nasas-lcross-satellite-to-impact-the-moon-oct-9/", site: "NASA" },
    { title: "NASA Missions Uncover the Moon’s Buried Treasures", url: "https://www.nasa.gov/news-release/nasa-missions-uncover-the-moons-buried-treasures/", site: "NASA" },
  ],
  "grail": [
    { title: "NASA Mission Points to Origin of “Ocean of Storms” on Earth’s Moon", url: "https://www.nasa.gov/news-release/nasa-mission-points-to-origin-of-ocean-of-storms-on-earths-moon/", site: "NASA" },
    { title: "Montana Students Pick Winning Names for Moon Craft", url: "https://www.nasa.gov/solar-system/moon/montana-students-pick-winning-names-for-moon-craft/", site: "NASA" },
    { title: "GRAIL’s Final Resting Spot", url: "https://science.nasa.gov/photojournal/grails-final-resting-spot/", site: "NASA Science" },
    { title: "Ebb and Flow’s Final Moments", url: "https://science.nasa.gov/photojournal/ebb-and-flows-final-moments/", site: "NASA Science" },
  ],
  "insight": [
    { title: "Saying ‘Farewell’ to InSight Mars Lander", url: "https://www.nasa.gov/image-article/saying-farewell-insight-mars-lander/", site: "NASA" },
    { title: "HiRISE Views Impact Crater Matching InSight’s Seismic Data", url: "https://science.nasa.gov/photojournal/hirise-views-impact-crater-matching-insights-seismic-data/", site: "NASA Science" },
    { title: "HiRISE Studies the Dust on InSight", url: "https://science.nasa.gov/resource/hirise-studies-the-dust-on-insight/", site: "NASA Science" },
    { title: "InSight Sees Drifting Clouds on Mars", url: "https://www.nasa.gov/image-article/insight-sees-drifting-clouds-mars/", site: "NASA" },
  ],
  "ingenuity": [
    { title: "After Three Years on Mars, NASA’s Ingenuity Helicopter Mission Ends", url: "https://www.nasa.gov/news-release/after-three-years-on-mars-nasas-ingenuity-helicopter-mission-ends/", site: "NASA" },
    { title: "NASA to Attempt First Controlled Flight on Mars As Soon As Monday", url: "https://www.nasa.gov/news-release/nasa-to-attempt-first-controlled-flight-on-mars-as-soon-as-monday/", site: "NASA" },
    { title: "Ingenuity’s Hard Landing", url: "https://science.nasa.gov/photojournal/ingenuitys-hard-landing/", site: "NASA Science" },
    { title: "Mars Helicopter Team Witnesses Final Downlink", url: "https://science.nasa.gov/photojournal/mars-helicopter-team-witnesses-final-downlink/", site: "NASA Science" },
  ],
};

/** NASA Eyes on the Solar System object ids: the real trajectory, flown in 3D. */
export const EYES: Record<string, string> = {
  "grail": "sc_grail_a",
  "lcross": "sc_lcross",
  "phoenix": "sc_phoenix",
  "pathfinder-sojourner": "sc_mars_pathfinder",
  "mars-polar-lander": "sc_mars_polar_lander",
  "viking-1": "sc_viking_1_lander_landing_site",
  "viking-2": "sc_viking_2_lander_landing_site",
  "insight": "sc_insight",
  "spirit": "sc_mars_exploration_rover_2",
  "opportunity": "sc_mars_exploration_rover_1",
};

export const eyesUrl = (id: string) => `https://eyes.nasa.gov/apps/solar-system/#/${id}?embed=true&logo=false&menu=false&featured=false&search=false&shareButton=false`;
