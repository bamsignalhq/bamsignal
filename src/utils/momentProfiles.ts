import type { MomentPageContent } from "../data/momentPages";
import type { DiscoverProfile } from "../types";
import { fetchCityHomeProfiles } from "../services/cityHome";
import { cityHomeToDiscoverProfile } from "./citySpotlight";
import { normalizeCityName } from "./guestCity";

const PREVIEW_NAMES: [string, string, string] = ["Adaeze", "Chidi", "Sandra"];
const PREVIEW_AGES: [number, number, number] = [26, 28, 25];

function matchesMoment(profile: DiscoverProfile, moment: MomentPageContent): boolean {
  const hay = [
    profile.bio,
    ...(profile.interests || []),
    ...(profile.intents || [])
  ]
    .join(" ")
    .toLowerCase();
  return moment.interestKeywords.some((keyword) => hay.includes(keyword.toLowerCase()));
}

function buildLocalPreviews(moment: MomentPageContent, city: string): DiscoverProfile[] {
  const normalizedCity = normalizeCityName(city);
  return PREVIEW_NAMES.map((name, index) => ({
    id: `moment-${moment.id}-${normalizedCity.toLowerCase()}-${index}`,
    name,
    age: PREVIEW_AGES[index],
    gender: index === 1 ? "Man" : "Woman",
    lookingFor: "Everyone",
    city: normalizedCity,
    bio: moment.situation.split(".")[0] + ".",
    photo: moment.imageSet[index % moment.imageSet.length],
    intents: [],
    interests: moment.sampleInterests,
    verified: index !== 1,
    premium: false,
    lastActiveAt: new Date(Date.now() - index * 3600_000).toISOString()
  }));
}

export async function loadMomentProfiles(
  moment: MomentPageContent,
  city: string
): Promise<DiscoverProfile[]> {
  const normalizedCity = normalizeCityName(city);
  const remote = await fetchCityHomeProfiles(normalizedCity, 8);
  const localOnly = remote
    .map(cityHomeToDiscoverProfile)
    .filter((profile) => profile.city?.toLowerCase() === normalizedCity.toLowerCase());

  const matched = localOnly.filter((profile) => matchesMoment(profile, moment));
  const pool = matched.length >= 2 ? matched : localOnly;
  if (pool.length >= 2) {
    return pool.slice(0, 3);
  }

  return buildLocalPreviews(moment, normalizedCity);
}
