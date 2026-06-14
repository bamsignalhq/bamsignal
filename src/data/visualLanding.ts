import { HERO_IMAGES, MOMENT_SETS } from "../constants/showcase";

/** Hero — three slides for the landing carousel */
export const HERO_STACK = {
  main: {
    id: "hero-main",
    src: HERO_IMAGES.main,
    alt: "Young Nigerian professionals in Lagos"
  },
  accents: [
    {
      id: "a1",
      src: MOMENT_SETS.lagosRooftop[0],
      alt: "Lagos rooftop hangout"
    },
    {
      id: "a2",
      src: MOMENT_SETS.suyaChill[0],
      alt: "Suya and chill with friends"
    }
  ] as const
} as const;

export const HERO_SLIDES = [HERO_STACK.main, ...HERO_STACK.accents] as const;

/** @deprecated Use HERO_STACK */
export const HERO_COLLAGE = [
  { id: "h1", src: HERO_STACK.main.src, alt: HERO_STACK.main.alt, priority: true },
  { id: "h2", src: HERO_STACK.accents[0].src, alt: HERO_STACK.accents[0].alt },
  { id: "h3", src: HERO_STACK.accents[1].src, alt: HERO_STACK.accents[1].alt }
] as const;

export const HERO_MAIN_IMAGE = HERO_IMAGES.main;

export const ACTIVITY_BUBBLES = [
  "✓ New signal in Lekki",
  "✓ New profile in Abuja",
  "✓ Someone nearby joined in Port Harcourt"
] as const;

export type CityVisual = {
  id: string;
  name: string;
  tagline: string;
  profiles: { photo: string; alt: string }[];
};

const cityPhoto = (city: string, src: string, label: string) => ({
  photo: src,
  alt: `${label} in ${city}`
});

/** Three photos per city — always 01, 02, 03 from that city's moment set */
function cityProfiles(
  city: string,
  set: readonly [string, string, string],
  labels: [string, string, string]
) {
  return [
    cityPhoto(city, set[0], labels[0]),
    cityPhoto(city, set[1], labels[1]),
    cityPhoto(city, set[2], labels[2])
  ];
}

const SUNDAY_HANGOUT_TRIO = [
  MOMENT_SETS.sundayHangout[0],
  MOMENT_SETS.sundayHangout[1],
  MOMENT_SETS.sundayHangout[2]
] as const;

export const CITIES_VISUAL: CityVisual[] = [
  {
    id: "lagos",
    name: "Lagos",
    tagline: "Fast-paced connections",
    profiles: cityProfiles("Lagos", MOMENT_SETS.lagosRooftop, [
      "Rooftop linkup",
      "Skyline hangout",
      "Evening vibes"
    ])
  },
  {
    id: "abuja",
    name: "Abuja",
    tagline: "Professionals & entrepreneurs",
    profiles: cityProfiles("Abuja", MOMENT_SETS.movieDate, [
      "Cinema date",
      "Movie night",
      "Date night"
    ])
  },
  {
    id: "ph",
    name: "Port Harcourt",
    tagline: "Vibes & ambition",
    profiles: cityProfiles("Port Harcourt", MOMENT_SETS.beachDay, [
      "Beach outing",
      "Coastal day",
      "Weekend escape"
    ])
  },
  {
    id: "enugu",
    name: "Enugu",
    tagline: "Meaningful connections",
    profiles: cityProfiles("Enugu", SUNDAY_HANGOUT_TRIO, [
      "Sunday hangout",
      "Social circle",
      "Chill afternoon"
    ])
  },
  {
    id: "owerri",
    name: "Owerri",
    tagline: "Social & vibrant",
    profiles: cityProfiles("Owerri", MOMENT_SETS.roadTrip, [
      "Road trip",
      "Weekend drive",
      "Adventure"
    ])
  },
  {
    id: "benin",
    name: "Benin",
    tagline: "Real people. Real vibes.",
    profiles: cityProfiles("Benin", MOMENT_SETS.suyaChill, [
      "Suya & chill",
      "After-work spot",
      "Good company"
    ])
  },
  {
    id: "uyo",
    name: "Uyo",
    tagline: "Warm connections & culture",
    profiles: cityProfiles("Uyo", MOMENT_SETS.beachDay, [
      "Beach day",
      "Coastal vibes",
      "Weekend outing"
    ])
  },
  {
    id: "asaba",
    name: "Asaba",
    tagline: "Close-knit community vibes",
    profiles: cityProfiles("Asaba", MOMENT_SETS.roadTrip, [
      "Road trip",
      "Weekend escape",
      "Adventure"
    ])
  },
  {
    id: "abeokuta",
    name: "Abeokuta",
    tagline: "Rooted & real",
    profiles: cityProfiles("Abeokuta", SUNDAY_HANGOUT_TRIO, [
      "Sunday hangout",
      "Community time",
      "Social hangout"
    ])
  },
  {
    id: "ibadan",
    name: "Ibadan",
    tagline: "Classic city, fresh energy",
    profiles: cityProfiles("Ibadan", MOMENT_SETS.movieDate, [
      "Cinema date",
      "Movie night",
      "Date night"
    ])
  }
];

/** One card per moment — each uses the -01 image from its own set */
export const SIGNAL_MOMENTS = [
  { id: "suya", title: "Suya & Chill", image: MOMENT_SETS.suyaChill[0], tagline: "Good food, better company" },
  { id: "beach", title: "Beach Day", image: MOMENT_SETS.beachDay[0], tagline: "Sun, sand & signals" },
  { id: "movie", title: "Movie Date", image: MOMENT_SETS.movieDate[0], tagline: "Cinema nights in the city" },
  { id: "sunday", title: "Sunday Hangout", image: MOMENT_SETS.sundayHangout[0], tagline: "Chill vibes after church" },
  { id: "roadtrip", title: "Road Trip", image: MOMENT_SETS.roadTrip[0], tagline: "Adventure with the right person" },
  { id: "rooftop", title: "Lagos Rooftop", image: MOMENT_SETS.lagosRooftop[0], tagline: "Skyline views & linkups" }
] as const;

/** Premium cards — 01, 02, 03 from the rooftop set */
export const PREMIUM_VISUAL = [
  { id: "priority", label: "Priority signals", image: MOMENT_SETS.lagosRooftop[0] },
  { id: "unlimited", label: "Unlimited discovery", image: MOMENT_SETS.lagosRooftop[1] },
  { id: "advanced", label: "Advanced matching", image: MOMENT_SETS.lagosRooftop[2] }
] as const;

export const FINAL_CTA_IMAGE = MOMENT_SETS.sundayHangout[0];
