import { MOMENT_SETS } from "../constants/showcase";

export type MomentPageId = "suya" | "beach" | "movie" | "sunday" | "roadtrip" | "rooftop";

export type MomentPageContent = {
  id: MomentPageId;
  slug: string;
  title: string;
  titleInLagos?: string;
  tagline: string;
  heroImage: string;
  imageSet: readonly [string, string, string] | readonly string[];
  eyebrow: string;
  description: string;
  situation: string;
  interestKeywords: string[];
  sampleInterests: string[];
};

export const MOMENT_PAGES: Record<MomentPageId, MomentPageContent> = {
  suya: {
    id: "suya",
    slug: "suya",
    title: "Suya & Chill",
    tagline: "Good food, better company",
    heroImage: MOMENT_SETS.suyaChill[0],
    imageSet: MOMENT_SETS.suyaChill,
    eyebrow: "Food & vibes",
    description: "Late-evening suya runs, small chops, and easy conversation — the kind of plan that feels natural, not forced.",
    situation:
      "You are not trying to impress anyone with a big date. You want good food, laughter, and someone who is comfortable being real after a long day.",
    interestKeywords: ["food", "suya", "chill", "hangout"],
    sampleInterests: ["Food", "Music", "Nightlife"]
  },
  beach: {
    id: "beach",
    slug: "beach",
    title: "Beach Day",
    tagline: "Sun, sand & signals",
    heroImage: MOMENT_SETS.beachDay[0],
    imageSet: MOMENT_SETS.beachDay,
    eyebrow: "Weekend escape",
    description: "Coastal air, light plans, and someone who matches your pace — from a calm shoreline walk to a full beach day.",
    situation:
      "The city has been loud all week. A beach day is your reset: sun, water, and a connection that feels easy outdoors.",
    interestKeywords: ["beach", "travel", "outdoor", "weekend"],
    sampleInterests: ["Travel", "Fitness", "Photography"]
  },
  movie: {
    id: "movie",
    slug: "movie",
    title: "Movie Date",
    tagline: "Cinema nights in the city",
    heroImage: MOMENT_SETS.movieDate[0],
    imageSet: MOMENT_SETS.movieDate,
    eyebrow: "City nights",
    description: "Pick a film, grab popcorn, and see if the conversation continues after the credits roll.",
    situation:
      "A cinema date is low pressure but intentional — shared reactions, inside jokes, and a reason to meet in a familiar part of town.",
    interestKeywords: ["movie", "cinema", "film", "date"],
    sampleInterests: ["Movies", "Music", "Food"]
  },
  sunday: {
    id: "sunday",
    slug: "sunday",
    title: "Sunday Hangout",
    tagline: "Chill vibes after church",
    heroImage: MOMENT_SETS.sundayHangout[0],
    imageSet: MOMENT_SETS.sundayHangout,
    eyebrow: "Slow Sunday",
    description: "Brunch, family-style gist, or a quiet afternoon — Sunday plans with someone who respects your rhythm.",
    situation:
      "Sundays are for reset: faith, family, food, and maybe someone new who fits into that calm, grounded energy.",
    interestKeywords: ["sunday", "church", "brunch", "family"],
    sampleInterests: ["Faith", "Food", "Community"]
  },
  roadtrip: {
    id: "roadtrip",
    slug: "roadtrip",
    title: "Road Trip",
    tagline: "Adventure with the right person",
    heroImage: MOMENT_SETS.roadTrip[0],
    imageSet: MOMENT_SETS.roadTrip,
    eyebrow: "Weekend adventure",
    description: "Short drives, new scenery, and playlists on repeat — best with someone who travels light and laughs often.",
    situation:
      "You want more than another indoor hangout. A road trip is about shared adventure, good music, and stories on the way back.",
    interestKeywords: ["road", "travel", "adventure", "drive"],
    sampleInterests: ["Travel", "Music", "Photography"]
  },
  rooftop: {
    id: "rooftop",
    slug: "rooftop",
    title: "Rooftop Vibes",
    titleInLagos: "Lagos Rooftop",
    tagline: "Skyline views & linkups",
    heroImage: MOMENT_SETS.lagosRooftop[0],
    imageSet: MOMENT_SETS.lagosRooftop,
    eyebrow: "Evening linkups",
    description: "Golden hour, city lights, and conversation above the noise — rooftop energy when you want something memorable.",
    situation:
      "You want a setting that feels special without trying too hard. Rooftops give you views, ambience, and space to talk.",
    interestKeywords: ["rooftop", "nightlife", "views", "linkup"],
    sampleInterests: ["Nightlife", "Food", "Music"]
  }
};

export const MOMENT_SLUGS = Object.keys(MOMENT_PAGES) as MomentPageId[];

export function getMomentPage(id: string): MomentPageContent | null {
  return MOMENT_PAGES[id as MomentPageId] ?? null;
}

export function momentDisplayTitle(moment: MomentPageContent, city: string): string {
  if (moment.id === "rooftop" && city.toLowerCase() === "lagos" && moment.titleInLagos) {
    return moment.titleInLagos;
  }
  return moment.title;
}
