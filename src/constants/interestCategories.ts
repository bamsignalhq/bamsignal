export const MIN_PROFILE_INTERESTS = 3;
export const MAX_PROFILE_INTERESTS = 10;
export const PROFILE_INTERESTS_PREVIEW = 4;

export type InterestCategory = {
  id: string;
  label: string;
  interests: readonly string[];
};

export const INTEREST_CATEGORIES: readonly InterestCategory[] = [
  {
    id: "entertainment",
    label: "Entertainment",
    interests: ["Afrobeats", "Nollywood", "Movies", "Comedy", "Live comedy", "Gaming"]
  },
  {
    id: "music",
    label: "Music",
    interests: ["Gospel music", "Highlife", "Hip-hop", "Wizkid & Davido", "Asake & Burna"]
  },
  {
    id: "food",
    label: "Food",
    interests: [
      "Suya & chill",
      "Jollof debates",
      "Amala & ewedu",
      "Pepper soup",
      "Buka hopping",
      "Zobo & small chops",
      "Palm wine"
    ]
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    interests: [
      "Beach days",
      "Road trips",
      "Rooftop hangouts",
      "Lagos brunch",
      "Fashion",
      "Sneaker culture",
      "Photography",
      "Reading"
    ]
  },
  {
    id: "sports",
    label: "Sports & Fitness",
    interests: ["Football", "EPL banter", "Gym", "CrossFit Naija", "Padel & tennis", "Swimming", "Hiking & nature"]
  },
  {
    id: "faith",
    label: "Faith & Community",
    interests: ["Church community", "Mosque hangouts", "Volunteering", "Family"]
  },
  {
    id: "culture",
    label: "Culture",
    interests: [
      "Owambe",
      "Detty December",
      "Aso ebi season",
      "Traditional wedding",
      "White wedding",
      "Ankara fashion"
    ]
  },
  {
    id: "career",
    label: "Career & Growth",
    interests: ["Business", "Tech", "Side hustle culture", "Networking", "Entrepreneurship"]
  },
  {
    id: "naija",
    label: "Naija Lifestyle",
    interests: [
      "Island life",
      "Mainland explorer",
      "Danfo stories",
      "Okada vibes",
      "Mama put runs",
      "NYSC stories"
    ]
  }
] as const;

export const ALL_CATEGORIZED_INTERESTS: string[] = INTEREST_CATEGORIES.flatMap((category) => [
  ...category.interests
]);

/** Legacy tags — still valid on saved profiles, omitted from the picker */
const LEGACY_INTERESTS = [
  "Travel",
  "Food",
  "Fitness",
  "Music",
  "Arts",
  "Cooking",
  "Dancing",
  "Skincare",
  "Street food tours",
  "Car meets",
  "PS5 nights",
  "Afro dance",
  "Island hopping",
  "Tech bro / sis",
  "Detty December plans",
  "Board games",
  "Podcasts",
  "Crypto & forex",
  "Real estate talk",
  "Politics banter",
  "Church choir",
  "Mosque community",
  "Pet lover",
  "Content creation"
] as const;

export const INTEREST_OPTIONS: readonly string[] = [
  ...new Set([...ALL_CATEGORIZED_INTERESTS, ...LEGACY_INTERESTS])
];
