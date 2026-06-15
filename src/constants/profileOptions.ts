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
  "Comedy",
  "Asake & Burna",
  "Wizkid & Davido",
  "Gospel music",
  "Hip-hop",
  "Highlife",
  "Palm wine",
  "Zobo & small chops",
  "Mama put runs",
  "Buka hopping",
  "Danfo stories",
  "Okada vibes",
  "Island hopping",
  "Mainland explorer",
  "NYSC stories",
  "Tech bro / sis",
  "Side hustle culture",
  "Aso ebi season",
  "Traditional wedding",
  "White wedding",
  "Detty December plans",
  "CrossFit Naija",
  "Padel & tennis",
  "Swimming",
  "Hiking & nature",
  "Board games",
  "Podcasts",
  "Crypto & forex",
  "Real estate talk",
  "Politics banter",
  "Church choir",
  "Mosque community",
  "Volunteering",
  "Pet lover",
  "Cooking",
  "Dancing",
  "Fashion",
  "Skincare",
  "Content creation"
] as const;

export const OCCUPATIONS = [
  "Software Engineer",
  "Doctor",
  "Nurse",
  "Pharmacist",
  "Lawyer",
  "Accountant",
  "Banker",
  "Teacher",
  "Entrepreneur",
  "Business Owner",
  "Civil Servant",
  "Marketing",
  "Sales",
  "Designer",
  "Content Creator",
  "Student",
  "Graduate / NYSC",
  "Trader",
  "Fashion Designer",
  "Real Estate Agent",
  "Pilot",
  "Architect",
  "Engineer",
  "Consultant",
  "HR Professional",
  "Chef",
  "Hospitality",
  "Military / Security",
  "Clergy",
  "Artist",
  "Athlete",
  "Driver / Logistics",
  "Artisan",
  "Farmer",
  "Other",
  "Prefer not to say"
] as const;

export type Occupation = (typeof OCCUPATIONS)[number];

export const GENOTYPES = ["AA", "AS", "SS", "AC", "SC", "CC", "Prefer not to say"] as const;

export type Genotype = (typeof GENOTYPES)[number];

export const KIDS_PREFERENCES = [
  "Has kids",
  "No kids",
  "Wants kids",
  "Doesn't want kids",
  "Open to kids",
  "Prefer not to say"
] as const;

export type KidsPreference = (typeof KIDS_PREFERENCES)[number];

/** Optional filter picklists — same values, excluding "Prefer not to say" for filters */
export const FILTER_RELIGIONS = RELIGIONS.filter((r) => r !== "Prefer not to say");
export const FILTER_ETHNICITIES = ETHNIC_BACKGROUNDS.filter((e) => e !== "Prefer not to say");
export const FILTER_LIFESTYLES = SOCIAL_LIFESTYLES.filter((l) => l !== "Prefer not to say");
export const FILTER_OCCUPATIONS = OCCUPATIONS.filter((o) => o !== "Prefer not to say");
export const FILTER_GENOTYPES = GENOTYPES.filter((g) => g !== "Prefer not to say");
export const FILTER_KIDS_PREFERENCES = KIDS_PREFERENCES.filter((k) => k !== "Prefer not to say");
