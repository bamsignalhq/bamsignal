import type { Religion } from "../types";
import {
  ALL_NIGERIAN_CITIES,
  NIGERIAN_STATES,
  citiesForState,
  metroForCity,
  searchCitiesInState,
  stateForCity
} from "../data/nigeriaLocations";

export { NIGERIAN_STATES, citiesForState, stateForCity, ALL_NIGERIAN_CITIES, searchCitiesInState, metroForCity };

/** @deprecated Use ALL_NIGERIAN_CITIES or citiesForState */
export const NIGERIAN_CITIES = ALL_NIGERIAN_CITIES;

export const RELIGIONS: Religion[] = [
  "Christian",
  "Muslim",
  "Traditional",
  "Other",
  "Prefer not to say"
];

export const ETHNIC_BACKGROUNDS = [
  "Igbo",
  "Yoruba",
  "Hausa",
  "Fulani",
  "Kanuri",
  "Ijaw",
  "Edo",
  "Tiv",
  "Nupe",
  "Igala",
  "Ibibio",
  "Efik",
  "Urhobo",
  "Isoko",
  "Itsekiri",
  "Idoma",
  "Ebira",
  "Esan",
  "Angas",
  "Berom",
  "Gbagyi",
  "Jukun",
  "Ogoni",
  "Tarok",
  "Bachama",
  "Egun",
  "Ekoi",
  "Gwari",
  "Igede",
  "Ikwerre",
  "Kataf",
  "Mumuye",
  "Ron",
  "Ukwuani",
  "Bura",
  "Chokwe",
  "Kalabari",
  "Kambari",
  "Koro",
  "Kuteb",
  "Mada",
  "Margi",
  "Hausa-Fulani",
  "Ndola",
  "Ogori",
  "Okun",
  "Other",
  "Prefer not to say"
] as const;

export type EthnicBackground = (typeof ETHNIC_BACKGROUNDS)[number];

export const SOCIAL_LIFESTYLES = [
  "Student",
  "Young Professional",
  "Entrepreneur",
  "Business Owner",
  "Executive",
  "Creative",
  "Content Creator",
  "Influencer",
  "Freelancer",
  "Remote Worker",
  "Tech",
  "Finance",
  "Healthcare",
  "Real Estate",
  "Hospitality",
  "Public Sector",
  "Private Sector",
  "NGO / Development",
  "Military / Security",
  "Fashion & Beauty",
  "Nightlife & Events",
  "Athlete / Sports",
  "Prefer not to say"
] as const;

export type SocialLifestyle = (typeof SOCIAL_LIFESTYLES)[number];

export const INTEREST_OPTIONS = [
  "Afrobeats",
  "Nollywood",
  "Football",
  "EPL banter",
  "Suya & chill",
  "Owambe",
  "Detty December",
  "Jollof debates",
  "Amala & ewedu",
  "Pepper soup",
  "Live comedy",
  "Rooftop hangouts",
  "Lagos brunch",
  "Island life",
  "Beach days",
  "Road trips",
  "Street food tours",
  "Ankara fashion",
  "Sneaker culture",
  "Car meets",
  "PS5 nights",
  "Afro dance",
  "Church community",
  "Mosque hangouts",
  "Music",
  "Movies",
  "Travel",
  "Fitness",
  "Business",
  "Photography",
  "Reading",
  "Gaming",
  "Arts",
  "Networking",
  "Comedy"
] as const;

/** Optional filter picklists — same values, excluding "Prefer not to say" for filters */
export const FILTER_RELIGIONS = RELIGIONS.filter((r) => r !== "Prefer not to say");
export const FILTER_ETHNICITIES = ETHNIC_BACKGROUNDS.filter((e) => e !== "Prefer not to say");
export const FILTER_LIFESTYLES = SOCIAL_LIFESTYLES.filter((l) => l !== "Prefer not to say");
