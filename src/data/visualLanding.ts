import { HERO_IMAGES, MOMENT_SETS } from "../constants/showcase";

/** Hero — three slides for the landing carousel */
export const HERO_STACK = {
  main: {
    id: "hero-main",
    src: HERO_IMAGES.main,
    alt: "Young Nigerian professionals in Lagos",
    objectPosition: "center 22%"
  },
  accents: [
    {
      id: "hero-2",
      src: HERO_IMAGES.panels[0],
      alt: "Young Nigerian professionals connecting in Lagos",
      objectPosition: "center 28%"
    },
    {
      id: "hero-3",
      src: HERO_IMAGES.panels[1],
      alt: "Lagos social scene with young professionals",
      objectPosition: "center 22%"
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
  },
  {
    id: "aba",
    name: "Aba",
    tagline: "Markets, music & real connections",
    profiles: cityProfiles("Aba", MOMENT_SETS.suyaChill, [
      "Suya & chill",
      "After-work spot",
      "Good company"
    ])
  },
  {
    id: "kaduna",
    name: "Kaduna",
    tagline: "Northern hustle, warm hearts",
    profiles: cityProfiles("Kaduna", SUNDAY_HANGOUT_TRIO, [
      "Sunday hangout",
      "Community time",
      "Social circle"
    ])
  },
  {
    id: "kano",
    name: "Kano",
    tagline: "Heritage city, new signals",
    profiles: cityProfiles("Kano", MOMENT_SETS.movieDate, [
      "Cinema date",
      "Movie night",
      "Date night"
    ])
  },
  {
    id: "jos",
    name: "Jos",
    tagline: "Cool air, warm people",
    profiles: cityProfiles("Jos", MOMENT_SETS.roadTrip, [
      "Road trip",
      "Weekend escape",
      "Adventure"
    ])
  },
  {
    id: "calabar",
    name: "Calabar",
    tagline: "Coastal charm & good vibes",
    profiles: cityProfiles("Calabar", MOMENT_SETS.beachDay, [
      "Beach outing",
      "Coastal day",
      "Weekend escape"
    ])
  },
  {
    id: "warri",
    name: "Warri",
    tagline: "Energy, culture & connection",
    profiles: cityProfiles("Warri", MOMENT_SETS.suyaChill, [
      "Suya & chill",
      "After-work spot",
      "Good company"
    ])
  },
  {
    id: "onitsha",
    name: "Onitsha",
    tagline: "Commerce meets chemistry",
    profiles: cityProfiles("Onitsha", SUNDAY_HANGOUT_TRIO, [
      "Sunday hangout",
      "Social circle",
      "Chill afternoon"
    ])
  },
  {
    id: "awka",
    name: "Awka",
    tagline: "Capital city connections",
    profiles: cityProfiles("Awka", MOMENT_SETS.roadTrip, [
      "Road trip",
      "Weekend drive",
      "Adventure"
    ])
  },
  {
    id: "ilorin",
    name: "Ilorin",
    tagline: "Tradition meets today",
    profiles: cityProfiles("Ilorin", MOMENT_SETS.movieDate, [
      "Cinema date",
      "Movie night",
      "Date night"
    ])
  },
  {
    id: "akure",
    name: "Akure",
    tagline: "Sunshine & social scenes",
    profiles: cityProfiles("Akure", SUNDAY_HANGOUT_TRIO, [
      "Sunday hangout",
      "Community time",
      "Social hangout"
    ])
  },
  {
    id: "osogbo",
    name: "Osogbo",
    tagline: "Art, culture & community",
    profiles: cityProfiles("Osogbo", MOMENT_SETS.suyaChill, [
      "Suya & chill",
      "After-work spot",
      "Good company"
    ])
  },
  {
    id: "makurdi",
    name: "Makurdi",
    tagline: "River city rendezvous",
    profiles: cityProfiles("Makurdi", MOMENT_SETS.roadTrip, [
      "Road trip",
      "Weekend escape",
      "Adventure"
    ])
  },
  {
    id: "yenagoa",
    name: "Yenagoa",
    tagline: "Bay beauty & belonging",
    profiles: cityProfiles("Yenagoa", MOMENT_SETS.beachDay, [
      "Beach day",
      "Coastal vibes",
      "Weekend outing"
    ])
  },
  {
    id: "lokoja",
    name: "Lokoja",
    tagline: "Where rivers meet romance",
    profiles: cityProfiles("Lokoja", SUNDAY_HANGOUT_TRIO, [
      "Sunday hangout",
      "Social circle",
      "Chill afternoon"
    ])
  },
  {
    id: "minna",
    name: "Minna",
    tagline: "Heartland vibes",
    profiles: cityProfiles("Minna", MOMENT_SETS.movieDate, [
      "Cinema date",
      "Movie night",
      "Date night"
    ])
  },
  {
    id: "umuahia",
    name: "Umuahia",
    tagline: "Abia roots, real people",
    profiles: cityProfiles("Umuahia", MOMENT_SETS.suyaChill, [
      "Suya & chill",
      "Good food",
      "Good company"
    ])
  },
  {
    id: "sagamu",
    name: "Sagamu",
    tagline: "Gateway connections",
    profiles: cityProfiles("Sagamu", MOMENT_SETS.roadTrip, [
      "Road trip",
      "Weekend drive",
      "Adventure"
    ])
  },
  {
    id: "nnewi",
    name: "Nnewi",
    tagline: "Driven & down-to-earth",
    profiles: cityProfiles("Nnewi", SUNDAY_HANGOUT_TRIO, [
      "Sunday hangout",
      "Community time",
      "Social hangout"
    ])
  },
  {
    id: "zaria",
    name: "Zaria",
    tagline: "Student city sparks",
    profiles: cityProfiles("Zaria", MOMENT_SETS.movieDate, [
      "Cinema date",
      "Movie night",
      "Date night"
    ])
  },
  {
    id: "eket",
    name: "Eket",
    tagline: "Coastal calm & connection",
    profiles: cityProfiles("Eket", MOMENT_SETS.beachDay, [
      "Beach outing",
      "Coastal day",
      "Weekend escape"
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
