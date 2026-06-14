import { MOMENT_SETS, type ShowcaseKey } from "./showcase";

export type SignalMoment = {
  id: string;
  label: string;
  image: string;
  images: readonly string[];
};

export const SIGNAL_MOMENTS: SignalMoment[] = [
  {
    id: "suya",
    label: "Suya & Chill",
    image: MOMENT_SETS.suyaChill[0],
    images: MOMENT_SETS.suyaChill
  },
  {
    id: "beach",
    label: "Beach Day",
    image: MOMENT_SETS.beachDay[0],
    images: MOMENT_SETS.beachDay
  },
  {
    id: "movie",
    label: "Movie Date",
    image: MOMENT_SETS.movieDate[0],
    images: MOMENT_SETS.movieDate
  },
  {
    id: "sunday",
    label: "Sunday Hangout",
    image: MOMENT_SETS.sundayHangout[0],
    images: MOMENT_SETS.sundayHangout
  },
  {
    id: "road",
    label: "Road Trip",
    image: MOMENT_SETS.roadTrip[0],
    images: MOMENT_SETS.roadTrip
  },
  {
    id: "rooftop",
    label: "Lagos Rooftop",
    image: MOMENT_SETS.lagosRooftop[0],
    images: MOMENT_SETS.lagosRooftop
  }
];

const INTEREST_TO_MOMENT: Record<string, string> = {
  Food: "suya",
  Beach: "beach",
  Movies: "movie",
  Comedy: "movie",
  Travel: "road",
  "Road trips": "road",
  Music: "rooftop",
  Networking: "rooftop",
  Fashion: "rooftop"
};

/** Pick lifestyle moment chips for a profile from interests + rotation */
export function momentsForProfile(interests: string[] = [], profileId = ""): SignalMoment[] {
  const picked = new Set<string>();
  for (const interest of interests) {
    const id = INTEREST_TO_MOMENT[interest];
    if (id) picked.add(id);
  }
  if (picked.size < 2) {
    const hash = profileId.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    picked.add(SIGNAL_MOMENTS[hash % SIGNAL_MOMENTS.length].id);
    picked.add(SIGNAL_MOMENTS[(hash + 2) % SIGNAL_MOMENTS.length].id);
  }
  return SIGNAL_MOMENTS.filter((m) => picked.has(m.id)).slice(0, 4);
}
