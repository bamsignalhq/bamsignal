import { MOMENT_SETS } from "../../constants/showcase";

export type CitySeoMeta = {
  slug: string;
  name: string;
  state: string;
  vibe: string;
  hotspots: string;
  searchTerms: string[];
  heroImage: string;
  gallery: [string, string, string];
};

const gallery = (set: readonly string[]): [string, string, string] => [set[0], set[1], set[2]];

export const CITY_SEO_META: CitySeoMeta[] = [
  {
    slug: "lagos",
    name: "Lagos",
    state: "Lagos State",
    vibe: "fast-paced professionals, rooftop linkups, and beach-day chemistry",
    hotspots: "Lekki, VI, Ikeja, Yaba, and Mainland hangouts",
    searchTerms: ["dating in Lagos", "Lagos singles", "find love in Lagos", "Lagos dating app"],
    heroImage: MOMENT_SETS.lagosRooftop[0],
    gallery: gallery(MOMENT_SETS.lagosRooftop)
  },
  {
    slug: "abuja",
    name: "Abuja",
    state: "FCT",
    vibe: "polished professionals, cinema dates, and intentional connections",
    hotspots: "Wuse, Garki, Maitama, and Jabi Lake evenings",
    searchTerms: ["dating in Abuja", "Abuja singles", "find love in Abuja", "Abuja relationship app"],
    heroImage: MOMENT_SETS.movieDate[0],
    gallery: gallery(MOMENT_SETS.movieDate)
  },
  {
    slug: "port-harcourt",
    name: "Port Harcourt",
    state: "Rivers State",
    vibe: "creative energy, suya nights, and ambitious young professionals",
    hotspots: "GRA, Trans Amadi social spots, and waterfront chill",
    searchTerms: ["dating in Port Harcourt", "PH singles", "find love in Port Harcourt"],
    heroImage: MOMENT_SETS.beachDay[0],
    gallery: gallery(MOMENT_SETS.beachDay)
  },
  {
    slug: "enugu",
    name: "Enugu",
    state: "Enugu State",
    vibe: "warm conversations, Sunday hangouts, and grounded values",
    hotspots: "Independence Layout, New Haven, and coal-city social circles",
    searchTerms: ["dating in Enugu", "Enugu singles", "find love in Enugu"],
    heroImage: MOMENT_SETS.sundayHangout[0],
    gallery: gallery(MOMENT_SETS.sundayHangout.slice(0, 3) as [string, string, string])
  },
  {
    slug: "owerri",
    name: "Owerri",
    state: "Imo State",
    vibe: "vibrant nightlife, road-trip chemistry, and social confidence",
    hotspots: "Ikenegbu, World Bank area, and weekend getaway routes",
    searchTerms: ["dating in Owerri", "Owerri singles", "find love in Owerri"],
    heroImage: MOMENT_SETS.roadTrip[0],
    gallery: gallery(MOMENT_SETS.roadTrip)
  },
  {
    slug: "benin",
    name: "Benin City",
    state: "Edo State",
    vibe: "real talk, suya-and-chill dates, and culture-rich connections",
    hotspots: "GRA, Sapele Road social life, and artsy meetups",
    searchTerms: ["dating in Benin", "Benin City singles", "find love in Benin"],
    heroImage: MOMENT_SETS.suyaChill[0],
    gallery: gallery(MOMENT_SETS.suyaChill)
  },
  {
    slug: "ibadan",
    name: "Ibadan",
    state: "Oyo State",
    vibe: "classic city charm with fresh dating energy",
    hotspots: "Bodija, UI corridor, and Dugbe social scenes",
    searchTerms: ["dating in Ibadan", "Ibadan singles", "find love in Ibadan"],
    heroImage: MOMENT_SETS.movieDate[1],
    gallery: gallery(MOMENT_SETS.movieDate)
  },
  {
    slug: "uyo",
    name: "Uyo",
    state: "Akwa Ibom State",
    vibe: "warm hospitality, beach outings, and meaningful intent",
    hotspots: "Ewet Housing, Ibom Plaza area, and coastal weekend plans",
    searchTerms: ["dating in Uyo", "Uyo singles", "find love in Uyo"],
    heroImage: MOMENT_SETS.beachDay[1],
    gallery: gallery(MOMENT_SETS.beachDay)
  },
  {
    slug: "aba",
    name: "Aba",
    state: "Abia State",
    vibe: "hustle-minded singles who still make time for real connection",
    hotspots: "Ariaria social life, Ogbor Hill, and Asokoro-style linkups",
    searchTerms: ["dating in Aba", "Aba singles", "find love in Aba"],
    heroImage: MOMENT_SETS.suyaChill[1],
    gallery: gallery(MOMENT_SETS.suyaChill)
  },
  {
    slug: "asaba",
    name: "Asaba",
    state: "Delta State",
    vibe: "close-knit community vibes and intentional dating",
    hotspots: "GRA, Okpanam road social spots, and river-city evenings",
    searchTerms: ["dating in Asaba", "Asaba singles", "find love in Asaba"],
    heroImage: MOMENT_SETS.roadTrip[1],
    gallery: gallery(MOMENT_SETS.roadTrip)
  },
  {
    slug: "abeokuta",
    name: "Abeokuta",
    state: "Ogun State",
    vibe: "rooted values, Sunday hangouts, and steady relationship goals",
    hotspots: "Kuto, Panseke, and Olumo-side social circles",
    searchTerms: ["dating in Abeokuta", "Abeokuta singles", "find love in Abeokuta"],
    heroImage: MOMENT_SETS.sundayHangout[1],
    gallery: gallery(MOMENT_SETS.sundayHangout.slice(0, 3) as [string, string, string])
  },
  {
    slug: "kaduna",
    name: "Kaduna",
    state: "Kaduna State",
    vibe: "professional singles and faith-aware dating culture",
    hotspots: "Barnawa, Kaduna north social hubs, and weekend cinema dates",
    searchTerms: ["dating in Kaduna", "Kaduna singles", "find love in Kaduna"],
    heroImage: MOMENT_SETS.movieDate[2],
    gallery: gallery(MOMENT_SETS.movieDate)
  },
  {
    slug: "kano",
    name: "Kano",
    state: "Kano State",
    vibe: "respectful courtship, family values, and verified profiles",
    hotspots: "Nasarawa GRA, Brigade, and trusted community introductions",
    searchTerms: ["dating in Kano", "Kano singles", "find love in Kano", "halal dating Kano"],
    heroImage: MOMENT_SETS.sundayHangout[2],
    gallery: gallery(MOMENT_SETS.sundayHangout.slice(0, 3) as [string, string, string])
  },
  {
    slug: "jos",
    name: "Jos",
    state: "Plateau State",
    vibe: "cool-climate romance, hiking chemistry, and calm conversations",
    hotspots: "Rayfield, Bukuru road social life, and plateau weekend trips",
    searchTerms: ["dating in Jos", "Jos singles", "find love in Jos"],
    heroImage: MOMENT_SETS.roadTrip[2],
    gallery: gallery(MOMENT_SETS.roadTrip)
  },
  {
    slug: "calabar",
    name: "Calabar",
    state: "Cross River State",
    vibe: "resort-city warmth, beach-day dates, and easy conversation",
    hotspots: "Marina, Tinapa weekends, and Calabar carnival season linkups",
    searchTerms: ["dating in Calabar", "Calabar singles", "find love in Calabar"],
    heroImage: MOMENT_SETS.beachDay[2],
    gallery: gallery(MOMENT_SETS.beachDay)
  },
  {
    slug: "warri",
    name: "Warri",
    state: "Delta State",
    vibe: "bold personalities, suya nights, and no-nonsense intentions",
    hotspots: "Effurun, GRA, and waterfront chill spots",
    searchTerms: ["dating in Warri", "Warri singles", "find love in Warri"],
    heroImage: MOMENT_SETS.suyaChill[2],
    gallery: gallery(MOMENT_SETS.suyaChill)
  },
  {
    slug: "onitsha",
    name: "Onitsha",
    state: "Anambra State",
    vibe: "business-minded singles balancing ambition and affection",
    hotspots: "GRA, Awka road social life, and Anambra weekend linkups",
    searchTerms: ["dating in Onitsha", "Onitsha singles", "find love in Onitsha"],
    heroImage: MOMENT_SETS.lagosRooftop[1],
    gallery: gallery(MOMENT_SETS.lagosRooftop)
  },
  {
    slug: "akure",
    name: "Akure",
    state: "Ondo State",
    vibe: "university-town energy and relationship-ready professionals",
    hotspots: "Alagbaka, Oba-Ile corridor, and Ondo social weekends",
    searchTerms: ["dating in Akure", "Akure singles", "find love in Akure"],
    heroImage: MOMENT_SETS.sundayHangout[0],
    gallery: gallery(MOMENT_SETS.sundayHangout.slice(0, 3) as [string, string, string])
  },
  {
    slug: "lokoja",
    name: "Lokoja",
    state: "Kogi State",
    vibe: "confluence-city connections and down-to-earth dating",
    hotspots: "Ganaja road social spots and confluence-view meetups",
    searchTerms: ["dating in Lokoja", "Lokoja singles", "find love in Lokoja"],
    heroImage: MOMENT_SETS.roadTrip[0],
    gallery: gallery(MOMENT_SETS.roadTrip)
  },
  {
    slug: "yenagoa",
    name: "Yenagoa",
    state: "Bayelsa State",
    vibe: "waterfront calm, young professionals, and intentional signals",
    hotspots: "Ovom, Ekeki, and creek-side weekend plans",
    searchTerms: ["dating in Yenagoa", "Yenagoa singles", "find love in Yenagoa"],
    heroImage: MOMENT_SETS.beachDay[0],
    gallery: gallery(MOMENT_SETS.beachDay)
  },
  {
    slug: "maiduguri",
    name: "Maiduguri",
    state: "Borno State",
    vibe: "faith-forward dating, verified profiles, and respectful courtship",
    hotspots: "GRA, Bulumkutu Tu, and trusted community circles",
    searchTerms: ["dating in Maiduguri", "Maiduguri singles", "find love in Maiduguri"],
    heroImage: MOMENT_SETS.sundayHangout[1],
    gallery: gallery(MOMENT_SETS.sundayHangout.slice(0, 3) as [string, string, string])
  },
  {
    slug: "sokoto",
    name: "Sokoto",
    state: "Sokoto State",
    vibe: "values-led relationships and family-conscious matching",
    hotspots: "Gidan Iliya, Arkilla, and university-linked social groups",
    searchTerms: ["dating in Sokoto", "Sokoto singles", "find love in Sokoto"],
    heroImage: MOMENT_SETS.movieDate[0],
    gallery: gallery(MOMENT_SETS.movieDate)
  }
];

export function cityPostSlug(citySlug: string): string {
  return `find-love-in-${citySlug}-nigeria`;
}
