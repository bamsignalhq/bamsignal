/** Global City Network — Signal Events™ community cities. */

export type GlobalCityRegionId =
  | "nigeria"
  | "ghana"
  | "united-kingdom"
  | "ireland"
  | "united-states"
  | "canada"
  | "europe"
  | "south-africa"
  | "uae"
  | "australia"
  | "asia";

export type GlobalCityCommunityStatusId =
  | "launching-soon"
  | "community-growing"
  | "active-community"
  | "premium-community"
  | "legacy-community";

export type GlobalCityRegionDefinition = {
  id: GlobalCityRegionId;
  label: string;
};

export const GLOBAL_CITY_REGIONS: GlobalCityRegionDefinition[] = [
  { id: "nigeria", label: "Nigeria" },
  { id: "ghana", label: "Ghana" },
  { id: "united-kingdom", label: "United Kingdom" },
  { id: "ireland", label: "Ireland" },
  { id: "united-states", label: "United States" },
  { id: "canada", label: "Canada" },
  { id: "europe", label: "Europe" },
  { id: "south-africa", label: "South Africa" },
  { id: "uae", label: "UAE" },
  { id: "australia", label: "Australia" },
  { id: "asia", label: "Asia" }
];

export const GLOBAL_CITY_REGION_LABELS: Record<GlobalCityRegionId, string> = Object.fromEntries(
  GLOBAL_CITY_REGIONS.map((region) => [region.id, region.label])
) as Record<GlobalCityRegionId, string>;

export type GlobalCityCommunityStatusDefinition = {
  id: GlobalCityCommunityStatusId;
  label: string;
  description: string;
};

export const GLOBAL_CITY_COMMUNITY_STATUSES: GlobalCityCommunityStatusDefinition[] = [
  {
    id: "launching-soon",
    label: "Launching Soon",
    description: "Community forming — Signal Events™ landing prepared."
  },
  {
    id: "community-growing",
    label: "Community Growing",
    description: "Warm introductions and meetups building locally."
  },
  {
    id: "active-community",
    label: "Active Community",
    description: "Regular Signal Events™ gatherings with dignity and care."
  },
  {
    id: "premium-community",
    label: "Premium Community",
    description: "Reserved — elevated community experiences."
  },
  {
    id: "legacy-community",
    label: "Legacy Community",
    description: "Enduring couples and families honored locally."
  }
];

export const GLOBAL_CITY_COMMUNITY_STATUS_LABELS: Record<GlobalCityCommunityStatusId, string> =
  Object.fromEntries(GLOBAL_CITY_COMMUNITY_STATUSES.map((item) => [item.id, item.label])) as Record<
    GlobalCityCommunityStatusId,
    string
  >;

export type GlobalCityDefinition = {
  slug: string;
  name: string;
  regionId: GlobalCityRegionId;
  status: GlobalCityCommunityStatusId;
  /** Non-Nigeria diaspora communities. */
  diaspora: boolean;
  /** Featured on hub landing. */
  featured?: boolean;
};

function city(
  name: string,
  slug: string,
  regionId: GlobalCityRegionId,
  status: GlobalCityCommunityStatusId = "launching-soon",
  options: { diaspora?: boolean; featured?: boolean } = {}
): GlobalCityDefinition {
  return {
    name,
    slug,
    regionId,
    status,
    diaspora: options.diaspora ?? regionId !== "nigeria",
    featured: options.featured
  };
}

export const GLOBAL_CITY_NETWORK: GlobalCityDefinition[] = [
  // Nigeria
  city("Lagos", "lagos", "nigeria", "active-community", { featured: true }),
  city("Abuja", "abuja", "nigeria", "community-growing", { featured: true }),
  city("Port Harcourt", "port-harcourt", "nigeria", "community-growing", { featured: true }),
  city("Enugu", "enugu", "nigeria", "community-growing", { featured: true }),
  city("Owerri", "owerri", "nigeria", "launching-soon"),
  city("Benin City", "benin-city", "nigeria", "launching-soon"),
  city("Asaba", "asaba", "nigeria", "launching-soon"),
  city("Warri", "warri", "nigeria", "launching-soon"),
  city("Uyo", "uyo", "nigeria", "launching-soon"),
  city("Calabar", "calabar", "nigeria", "launching-soon"),
  city("Aba", "aba", "nigeria", "launching-soon"),
  city("Onitsha", "onitsha", "nigeria", "launching-soon"),
  city("Awka", "awka", "nigeria", "launching-soon"),
  city("Ibadan", "ibadan", "nigeria", "community-growing"),
  city("Ilorin", "ilorin", "nigeria", "launching-soon"),
  city("Kaduna", "kaduna", "nigeria", "launching-soon"),
  city("Jos", "jos", "nigeria", "launching-soon"),
  city("Kano", "kano", "nigeria", "launching-soon"),
  city("Maiduguri", "maiduguri", "nigeria", "launching-soon"),
  city("Yola", "yola", "nigeria", "launching-soon"),
  city("Makurdi", "makurdi", "nigeria", "launching-soon"),
  city("Lokoja", "lokoja", "nigeria", "launching-soon"),
  city("Minna", "minna", "nigeria", "launching-soon"),
  city("Abeokuta", "abeokuta", "nigeria", "launching-soon"),
  city("Akure", "akure", "nigeria", "launching-soon"),
  city("Osogbo", "osogbo", "nigeria", "launching-soon"),
  city("Ekiti", "ekiti", "nigeria", "launching-soon"),
  // Ghana
  city("Accra", "accra", "ghana", "community-growing"),
  city("Kumasi", "kumasi", "ghana", "launching-soon"),
  city("Takoradi", "takoradi", "ghana", "launching-soon"),
  city("Tema", "tema", "ghana", "launching-soon"),
  // United Kingdom
  city("London", "london", "united-kingdom", "community-growing", { featured: true }),
  city("Peckham", "peckham", "united-kingdom", "launching-soon"),
  city("Greenwich", "greenwich", "united-kingdom", "launching-soon"),
  city("Lewisham", "lewisham", "united-kingdom", "launching-soon"),
  city("Barking and Dagenham", "barking-and-dagenham", "united-kingdom", "launching-soon"),
  city("Newham", "newham", "united-kingdom", "launching-soon"),
  city("Manchester", "manchester", "united-kingdom", "community-growing", { featured: true }),
  city("Salford", "salford", "united-kingdom", "launching-soon"),
  city("Birmingham", "birmingham", "united-kingdom", "launching-soon"),
  city("Coventry", "coventry", "united-kingdom", "launching-soon"),
  city("Aberdeen", "aberdeen", "united-kingdom", "launching-soon"),
  city("Leeds", "leeds", "united-kingdom", "launching-soon"),
  city("Liverpool", "liverpool", "united-kingdom", "launching-soon"),
  city("Milton Keynes", "milton-keynes", "united-kingdom", "launching-soon"),
  city("Leicester", "leicester", "united-kingdom", "launching-soon"),
  city("Nottingham", "nottingham", "united-kingdom", "launching-soon"),
  // Ireland
  city("Dublin", "dublin", "ireland", "community-growing"),
  city("Blanchardstown", "blanchardstown", "ireland", "launching-soon"),
  city("Dundalk", "dundalk", "ireland", "launching-soon"),
  city("Cork", "cork", "ireland", "launching-soon"),
  city("Galway", "galway", "ireland", "launching-soon"),
  // United States
  city("Houston", "houston", "united-states", "community-growing", { featured: true }),
  city("Sugar Land", "sugar-land", "united-states", "launching-soon"),
  city("Katy", "katy", "united-states", "launching-soon"),
  city("Dallas", "dallas", "united-states", "community-growing", { featured: true }),
  city("Fort Worth", "fort-worth", "united-states", "launching-soon"),
  city("Arlington", "arlington", "united-states", "launching-soon"),
  city("Plano", "plano", "united-states", "launching-soon"),
  city("Atlanta", "atlanta", "united-states", "community-growing", { featured: true }),
  city("Gwinnett County", "gwinnett-county", "united-states", "launching-soon"),
  city("DeKalb County", "dekalb-county", "united-states", "launching-soon"),
  city("Silver Spring", "silver-spring", "united-states", "launching-soon"),
  city("Upper Marlboro", "upper-marlboro", "united-states", "launching-soon"),
  city("Bowie", "bowie", "united-states", "launching-soon"),
  city("Brooklyn", "brooklyn", "united-states", "launching-soon"),
  city("Queens", "queens", "united-states", "launching-soon"),
  city("The Bronx", "the-bronx", "united-states", "launching-soon"),
  city("Newark", "newark", "united-states", "launching-soon"),
  city("Irvington", "irvington", "united-states", "launching-soon"),
  city("Chicago", "chicago", "united-states", "launching-soon"),
  city("Los Angeles", "los-angeles", "united-states", "launching-soon"),
  city("San Francisco", "san-francisco", "united-states", "launching-soon"),
  city("Washington DC", "washington-dc", "united-states", "launching-soon"),
  city("Minneapolis", "minneapolis", "united-states", "launching-soon"),
  city("Philadelphia", "philadelphia", "united-states", "launching-soon"),
  city("Charlotte", "charlotte", "united-states", "launching-soon"),
  city("Baltimore", "baltimore", "united-states", "launching-soon"),
  // Canada
  city("Toronto", "toronto", "canada", "community-growing", { featured: true }),
  city("Mississauga", "mississauga", "canada", "launching-soon"),
  city("Brampton", "brampton", "canada", "community-growing", { featured: true }),
  city("Calgary", "calgary", "canada", "launching-soon"),
  city("Edmonton", "edmonton", "canada", "launching-soon"),
  city("Winnipeg", "winnipeg", "canada", "launching-soon"),
  city("Ottawa", "ottawa", "canada", "launching-soon"),
  city("Vancouver", "vancouver", "canada", "launching-soon"),
  city("Montreal", "montreal", "canada", "launching-soon"),
  // Europe
  city("Berlin", "berlin", "europe", "launching-soon"),
  city("Frankfurt", "frankfurt", "europe", "launching-soon"),
  city("Munich", "munich", "europe", "launching-soon"),
  city("Hamburg", "hamburg", "europe", "launching-soon"),
  city("Milan", "milan", "europe", "launching-soon"),
  city("Turin", "turin", "europe", "launching-soon"),
  city("Reggio Emilia", "reggio-emilia", "europe", "launching-soon"),
  city("Paris", "paris", "europe", "launching-soon"),
  city("Amsterdam", "amsterdam", "europe", "launching-soon"),
  city("Brussels", "brussels", "europe", "launching-soon"),
  city("Stockholm", "stockholm", "europe", "launching-soon"),
  // South Africa
  city("Johannesburg", "johannesburg", "south-africa", "launching-soon"),
  city("Midrand", "midrand", "south-africa", "launching-soon"),
  city("Cape Town", "cape-town", "south-africa", "launching-soon"),
  city("Pretoria", "pretoria", "south-africa", "launching-soon"),
  city("Durban", "durban", "south-africa", "launching-soon"),
  // UAE
  city("Dubai", "dubai", "uae", "community-growing", { featured: true }),
  city("Sharjah", "sharjah", "uae", "launching-soon"),
  city("Abu Dhabi", "abu-dhabi", "uae", "launching-soon"),
  // Australia
  city("Sydney", "sydney", "australia", "community-growing", { featured: true }),
  city("Melbourne", "melbourne", "australia", "launching-soon"),
  city("Brisbane", "brisbane", "australia", "launching-soon"),
  city("Perth", "perth", "australia", "launching-soon"),
  city("Adelaide", "adelaide", "australia", "launching-soon"),
  // Asia
  city("Singapore", "singapore", "asia", "launching-soon"),
  city("Kuala Lumpur", "kuala-lumpur", "asia", "launching-soon"),
  city("Tokyo", "tokyo", "asia", "launching-soon"),
  city("Bangkok", "bangkok", "asia", "launching-soon")
];

export const GLOBAL_CITY_BY_SLUG: Record<string, GlobalCityDefinition> = Object.fromEntries(
  GLOBAL_CITY_NETWORK.map((entry) => [entry.slug, entry])
);

export function getGlobalCity(slug: string): GlobalCityDefinition | undefined {
  return GLOBAL_CITY_BY_SLUG[slug];
}

export function listDiasporaCities(): GlobalCityDefinition[] {
  return GLOBAL_CITY_NETWORK.filter((city) => city.diaspora);
}

export function listFeaturedCities(): GlobalCityDefinition[] {
  return GLOBAL_CITY_NETWORK.filter((city) => city.featured);
}

export function listCitiesByRegion(regionId: GlobalCityRegionId): GlobalCityDefinition[] {
  return GLOBAL_CITY_NETWORK.filter((city) => city.regionId === regionId);
}

export function globalCityCommunityStatusLabel(status: GlobalCityCommunityStatusId): string {
  return GLOBAL_CITY_COMMUNITY_STATUS_LABELS[status];
}
