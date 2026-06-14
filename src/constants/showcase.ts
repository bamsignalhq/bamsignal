/** Local Nigerian showcase imagery — WebP only */

const BASE = "/showcase";

export const HERO_IMAGES = {
  main: `${BASE}/hero-lagos-young-professionals-01.webp`,
  panels: [
    `${BASE}/hero-lagos-young-professionals-02.webp`,
    `${BASE}/hero-lagos-young-professionals-03.webp`
  ] as const
} as const;

export const MOMENT_SETS = {
  suyaChill: [
    `${BASE}/suya-and-chill-01.webp`,
    `${BASE}/suya-and-chill-02.webp`,
    `${BASE}/suya-and-chill-03.webp`
  ] as const,
  beachDay: [
    `${BASE}/beach-day-01.webp`,
    `${BASE}/beach-day-02.webp`,
    `${BASE}/beach-day-03.webp`
  ] as const,
  movieDate: [
    `${BASE}/movie-date-01.webp`,
    `${BASE}/movie-date-02.webp`,
    `${BASE}/movie-date-03.webp`
  ] as const,
  sundayHangout: [
    `${BASE}/sunday-hangout-01.webp`,
    `${BASE}/sunday-hangout-02.webp`,
    `${BASE}/sunday-hangout-03.webp`,
    `${BASE}/sunday-hangout-mosque-01.webp`
  ] as const,
  roadTrip: [
    `${BASE}/road-trip-01.webp`,
    `${BASE}/road-trip-02.webp`,
    `${BASE}/road-trip-03.webp`
  ] as const,
  lagosRooftop: [
    `${BASE}/lagos-rooftop-01.webp`,
    `${BASE}/lagos-rooftop-02.webp`,
    `${BASE}/lagos-rooftop-03.webp`
  ] as const
} as const;

/** Primary card image per moment (first in each set) */
export const SHOWCASE = {
  hero: HERO_IMAGES.main,
  suyaChill: MOMENT_SETS.suyaChill[0],
  beachDay: MOMENT_SETS.beachDay[0],
  movieDate: MOMENT_SETS.movieDate[0],
  sundayHangout: MOMENT_SETS.sundayHangout[0],
  sundayHangoutMosque: MOMENT_SETS.sundayHangout[3],
  roadTrip: MOMENT_SETS.roadTrip[0],
  lagosRooftop: MOMENT_SETS.lagosRooftop[0]
} as const;

export type ShowcaseKey = keyof typeof SHOWCASE;

export function showcaseImage(key: ShowcaseKey): string {
  return SHOWCASE[key];
}

export function momentImages(
  key: keyof typeof MOMENT_SETS
): readonly string[] {
  return MOMENT_SETS[key];
}

/** Profile / city photos for discover mock data — primary (-01) image per city */
export const CITY_PROFILE_PHOTOS: Record<string, string> = {
  Lagos: MOMENT_SETS.lagosRooftop[0],
  Abuja: MOMENT_SETS.movieDate[0],
  "Port Harcourt": MOMENT_SETS.beachDay[0],
  Enugu: MOMENT_SETS.sundayHangout[0],
  Owerri: MOMENT_SETS.roadTrip[0],
  Benin: MOMENT_SETS.suyaChill[0],
  Uyo: MOMENT_SETS.beachDay[0],
  Aba: MOMENT_SETS.suyaChill[0],
  Asaba: MOMENT_SETS.roadTrip[0],
  Abeokuta: MOMENT_SETS.sundayHangout[0],
  Ibadan: MOMENT_SETS.movieDate[0]
};

export function photoForCity(city: string): string {
  return CITY_PROFILE_PHOTOS[city] ?? SHOWCASE.hero;
}
