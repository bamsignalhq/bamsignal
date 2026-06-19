import type { NigeriaStateLocation } from "./nigeriaLocationTypes";
import { PRIORITY_CITIES_BY_STATE } from "./nigeriaPriorityCities";

type StateSeed = {
  slug: string;
  name: string;
  region: string;
  intro: string;
  nearbyStates: string[];
};

const STATE_SEEDS: StateSeed[] = [
  {
    slug: "abia",
    name: "Abia",
    region: "South East",
    intro:
      "From Aba's market energy to Umuahia's capital calm, Abia daters often move between commerce and government circles. BamSignal helps you connect with context before chat.",
    nearbyStates: ["imo", "rivers", "akwa-ibom", "enugu"]
  },
  {
    slug: "adamawa",
    name: "Adamawa",
    region: "North East",
    intro:
      "Adamawa's Yola capital and highland communities carry a distinct north-east rhythm. More city guides are coming — set your state to discover people nearby.",
    nearbyStates: ["taraba", "gombe", "borno"]
  },
  {
    slug: "akwa-ibom",
    name: "Akwa Ibom",
    region: "South South",
    intro:
      "Akwa Ibom blends coastal life, civil service in Uyo, and oil-town energy in Eket. Signals tied to food, football, and local pride start good conversations.",
    nearbyStates: ["cross-river", "rivers", "abia"]
  },
  {
    slug: "anambra",
    name: "Anambra",
    region: "South East",
    intro:
      "Anambra's Onitsha commerce, Nnewi industry, and Awka governance create ambitious daters. Be direct, respectful, and specific in your signals.",
    nearbyStates: ["enugu", "imo", "delta", "kogi"]
  },
  {
    slug: "bauchi",
    name: "Bauchi",
    region: "North East",
    intro:
      "Bauchi plateau edges and Yankari travellers attract a mix of locals and visitors. City-level guides are expanding — list Bauchi on your profile meanwhile.",
    nearbyStates: ["plateau", "kaduna", "kano", "gombe"]
  },
  {
    slug: "bayelsa",
    name: "Bayelsa",
    region: "South South",
    intro:
      "Bayelsa's creeks and Yenagoa capital mean transport and river logistics shape dating. Public meetups in familiar towns keep things comfortable.",
    nearbyStates: ["rivers", "delta", "akwa-ibom"]
  },
  {
    slug: "benue",
    name: "Benue",
    region: "North Central",
    intro:
      "Benue's food culture and Middle Belt openness show up in dating — Makurdi professionals and hometown proud matches from Gboko and Otukpo.",
    nearbyStates: ["nasarawa", "kogi", "enugu", "taraba"]
  },
  {
    slug: "borno",
    name: "Borno",
    region: "North East",
    intro:
      "Borno rebuilding and Maiduguri community life continue to evolve. Location guides will expand carefully — use your profile city honestly.",
    nearbyStates: ["yobe", "adamawa", "gombe"]
  },
  {
    slug: "cross-river",
    name: "Cross River",
    region: "South South",
    intro:
      "Cross River hospitality shines in Calabar and the plateau resorts. Tourism, carnival season, and food make easy, respectful conversation starters.",
    nearbyStates: ["akwa-ibom", "benue", "ebonyi"]
  },
  {
    slug: "delta",
    name: "Delta",
    region: "South South",
    intro:
      "Delta spans Asaba capital life, Warri energy, and river communities. Bridge traffic and oil-city humour show up in how people plan meetups.",
    nearbyStates: ["edo", "anambra", "bayelsa", "rivers"]
  },
  {
    slug: "ebonyi",
    name: "Ebonyi",
    region: "South East",
    intro:
      "Ebonyi's Abakaliki capital and agricultural belt are growing on apps. Detailed LGA guides are on the way — set Ebonyi to appear in state discovery.",
    nearbyStates: ["enugu", "cross-river", "benue", "abia"]
  },
  {
    slug: "edo",
    name: "Edo",
    region: "South South",
    intro:
      "Benin City's royal culture and university towns like Ekpoma create a mix of tradition and student life. Cultural respect in chat matters here.",
    nearbyStates: ["delta", "ondo", "kogi", "anambra"]
  },
  {
    slug: "ekiti",
    name: "Ekiti",
    region: "South West",
    intro:
      "Ekiti's Ado-Ekiti capital and hill towns favour unhurried, sincere dating. More local pages coming soon.",
    nearbyStates: ["ondo", "osun", "kwara", "kogi"]
  },
  {
    slug: "enugu",
    name: "Enugu",
    region: "South East",
    intro:
      "Enugu hill city blends coal-state heritage with universities and a growing professional class. Calm, specific signals work better than hype.",
    nearbyStates: ["anambra", "ebonyi", "benue", "imo"]
  },
  {
    slug: "fct",
    name: "FCT",
    region: "North Central",
    intro:
      "Abuja spreads across districts from Wuse to Kubwa. District-level honesty on your profile prevents mismatched commute expectations.",
    nearbyStates: ["niger", "kaduna", "nasarawa", "kogi"]
  },
  {
    slug: "gombe",
    name: "Gombe",
    region: "North East",
    intro:
      "Gombe state's capital and agricultural communities are socially warm. Expanded city guides are planned.",
    nearbyStates: ["bauchi", "adamawa", "borno", "taraba"]
  },
  {
    slug: "imo",
    name: "Imo",
    region: "South East",
    intro:
      "Owerri's social scene and Orlu's hometown pride define much of Imo dating. Evening energy is high — many prefer daytime first meetups.",
    nearbyStates: ["abia", "anambra", "rivers", "enugu"]
  },
  {
    slug: "jigawa",
    name: "Jigawa",
    region: "North West",
    intro:
      "Jigawa's Dutse capital and rural LGAs value courtesy and family awareness in dating. Local SEO pages will roll out gradually.",
    nearbyStates: ["kano", "bauchi", "yobe", "katsina"]
  },
  {
    slug: "kaduna",
    name: "Kaduna",
    region: "North West",
    intro:
      "Kaduna blends creatives, institutions, and Zaria's student life. Choose public venues you trust and communicate plans clearly.",
    nearbyStates: ["kano", "niger", "plateau", "nasarawa", "fct"]
  },
  {
    slug: "kano",
    name: "Kano",
    region: "North West",
    intro:
      "Kano's scale and tradition require respectful, clear dating. Public family-friendly meetups and patient conversation build trust.",
    nearbyStates: ["kaduna", "jigawa", "katsina", "bauchi"]
  },
  {
    slug: "katsina",
    name: "Katsina",
    region: "North West",
    intro:
      "Katsina's historic city and rural LGAs value family-aware dating. Quality city guides are planned — not bulk thin pages.",
    nearbyStates: ["kano", "jigawa", "zamfara", "kaduna"]
  },
  {
    slug: "kebbi",
    name: "Kebbi",
    region: "North West",
    intro:
      "Kebbi river towns and Birnin Kebbi capital carry Sahel-west culture. City guides will be added without thin placeholder spam.",
    nearbyStates: ["sokoto", "niger", "zamfara"]
  },
  {
    slug: "kogi",
    name: "Kogi",
    region: "North Central",
    intro:
      "Kogi's Lokoja confluence makes it a natural halfway point for north-south matches. Okene and Idah add strong local identities.",
    nearbyStates: ["niger", "fct", "benue", "enugu", "anambra", "edo", "ondo", "ekiti", "kwara"]
  },
  {
    slug: "kwara",
    name: "Kwara",
    region: "North Central",
    intro:
      "Ilorin sits between north and south — faith, family, and university life shape dating here. Courtesy and clarity matter.",
    nearbyStates: ["niger", "kogi", "osun", "ekiti", "oyo"]
  },
  {
    slug: "lagos",
    name: "Lagos",
    region: "South West",
    intro:
      "Lagos is Nigeria's busiest dating market — Island, mainland, and corridor commutes all matter. Pin your area and plan public first meetups.",
    nearbyStates: ["ogun", "oyo", "ondo"]
  },
  {
    slug: "nasarawa",
    name: "Nasarawa",
    region: "North Central",
    intro:
      "Nasarawa Lafia capital and Keffi Abuja spillover are growing. Detailed LGA pages are coming — not thin doorway URLs.",
    nearbyStates: ["fct", "kaduna", "benue", "plateau"]
  },
  {
    slug: "niger",
    name: "Niger",
    region: "North Central",
    intro:
      "Niger state links Abuja corridor towns to Minna capital life. Commuter honesty on profiles prevents awkward distance surprises.",
    nearbyStates: ["fct", "kogi", "kwara", "kaduna", "kebbi"]
  },
  {
    slug: "ogun",
    name: "Ogun",
    region: "South West",
    intro:
      "Ogun touches Lagos daily — Abeokuta, Sagamu, and Ota daters often span both states. List where you actually sleep at night.",
    nearbyStates: ["lagos", "oyo", "ondo"]
  },
  {
    slug: "ondo",
    name: "Ondo",
    region: "South West",
    intro:
      "Akure capital calm and Owo heritage differ within one state. Do not treat Ondo as a single pin on the map.",
    nearbyStates: ["osun", "ekiti", "edo", "kogi", "ogun"]
  },
  {
    slug: "osun",
    name: "Osun",
    region: "South West",
    intro:
      "Osogbo arts, Ife campus life, and Yoruba heritage shape Osun dating. Respectful cultural curiosity opens better chats.",
    nearbyStates: ["oyo", "kwara", "ekiti", "ondo"]
  },
  {
    slug: "oyo",
    name: "Oyo",
    region: "South West",
    intro:
      "Ibadan's sprawl and Oyo town heritage share one state but different rhythms. Area-specific profiles get better signals.",
    nearbyStates: ["lagos", "ogun", "osun", "kwara"]
  },
  {
    slug: "plateau",
    name: "Plateau",
    region: "North Central",
    intro:
      "Jos cool air and scenic views attract outdoor-minded daters. Community sensitivity and public venues keep meetups comfortable.",
    nearbyStates: ["kaduna", "bauchi", "nasarawa", "benue"]
  },
  {
    slug: "rivers",
    name: "Rivers",
    region: "South South",
    intro:
      "Port Harcourt and Greater PH span multiple LGAs. GRA meetups, oil-city schedules, and direct signals fit Garden City culture.",
    nearbyStates: ["bayelsa", "imo", "abia", "akwa-ibom", "delta"]
  },
  {
    slug: "sokoto",
    name: "Sokoto",
    region: "North West",
    intro:
      "Sokoto caliphate heritage influences social norms — modest respectful dating is appreciated. City pages will expand thoughtfully.",
    nearbyStates: ["kebbi", "zamfara", "katsina", "niger"]
  },
  {
    slug: "taraba",
    name: "Taraba",
    region: "North East",
    intro:
      "Taraba's Jalingo capital and highland diversity create varied dating styles. Guides are planned without low-quality bulk publishing.",
    nearbyStates: ["adamawa", "benue", "plateau", "gombe"]
  },
  {
    slug: "yobe",
    name: "Yobe",
    region: "North East",
    intro:
      "Yobe communities value courtesy and family involvement in relationships. Local SEO content will arrive when quality standards are met.",
    nearbyStates: ["borno", "jigawa", "bauchi"]
  },
  {
    slug: "zamfara",
    name: "Zamfara",
    region: "North West",
    intro:
      "Zamfara Gusau capital and mining communities are socially close-knit. Indexable city pages will follow — not mass thin URLs.",
    nearbyStates: ["sokoto", "kebbi", "niger", "kaduna"]
  }
];

// Jigawa references katsina which we don't have as state - fix to valid neighbors only
// Fix jigawa nearby - remove katsina
const jigawa = STATE_SEEDS.find((s) => s.slug === "jigawa");
if (jigawa) jigawa.nearbyStates = ["kano", "bauchi", "yobe", "katsina"];

const kano = STATE_SEEDS.find((s) => s.slug === "kano");
if (kano) kano.nearbyStates = ["kaduna", "jigawa", "katsina", "bauchi"];

export function buildAllStates(): NigeriaStateLocation[] {
  return STATE_SEEDS.map((seed) => {
    const cities = PRIORITY_CITIES_BY_STATE[seed.slug] ?? [];
    const hasIndexableCity = cities.some((c) => c.indexable);
    return {
      ...seed,
      cities,
      indexable: hasIndexableCity
    };
  });
}
