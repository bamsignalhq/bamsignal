/** Shared SEO sitemap paths — keep in sync with src/content/seo/*.ts */
export const SEO_HUB_PATHS = [
  "/cities",
  "/help",
  "/safety",
  "/features",
  "/premium",
  "/faq",
  "/guides",
  "/compare"
];

export const CITY_SLUGS = [
  "lagos",
  "abuja",
  "port-harcourt",
  "enugu",
  "owerri",
  "benin",
  "ibadan",
  "uyo",
  "aba",
  "asaba",
  "kaduna",
  "kano",
  "jos",
  "calabar",
  "warri",
  "onitsha",
  "awka",
  "ilorin",
  "akure",
  "osogbo"
];

export const HELP_SLUGS = [
  "create-profile",
  "signals",
  "messages",
  "verification",
  "signal-pass",
  "boosts",
  "delete-account",
  "reset-pin",
  "photos",
  "contact-exchange"
];

export const SAFETY_SLUGS = [
  "meeting-safely",
  "avoid-romance-scams",
  "reporting-abuse",
  "privacy",
  "blocking-users",
  "contact-exchange",
  "never-send-money",
  "verification"
];

export const FEATURE_SLUGS = [
  "signals",
  "discover",
  "chats",
  "profile",
  "verification",
  "filters",
  "voice-intro",
  "contact-exchange",
  "people-interested-in-you",
  "boosts"
];

export const PREMIUM_SLUGS = [
  "signal-pass",
  "boost-visibility",
  "priority-introduction",
  "featured-profile",
  "quickie-pass"
];

export const FAQ_SLUGS = ["getting-started"];

export const GUIDE_SLUGS = [
  "conversation-starters",
  "first-message-ideas",
  "how-to-build-a-good-profile",
  "how-to-meet-new-people",
  "relationship-intentions",
  "online-privacy",
  "first-meetup-safety",
  "nigerian-social-discovery",
  "meaningful-connections",
  "profile-photo-tips"
];

export const COMPARE_SLUGS = [
  "bamsignal-vs-tinder",
  "bamsignal-vs-bumble",
  "bamsignal-vs-badoo",
  "bamsignal-vs-facebook-dating",
  "bamsignal-vs-traditional-matchmaking"
];

export const SEO_DETAIL_PATHS = [
  ...CITY_SLUGS.map((slug) => `/cities/${slug}`),
  ...HELP_SLUGS.map((slug) => `/help/${slug}`),
  ...SAFETY_SLUGS.map((slug) => `/safety/${slug}`),
  ...FEATURE_SLUGS.map((slug) => `/features/${slug}`),
  ...PREMIUM_SLUGS.map((slug) => `/premium/${slug}`),
  ...FAQ_SLUGS.map((slug) => `/faq/${slug}`),
  ...GUIDE_SLUGS.map((slug) => `/guides/${slug}`),
  ...COMPARE_SLUGS.map((slug) => `/compare/${slug}`)
];

export const LEGAL_STATIC_PATHS = [
  "/about",
  "/safety-policy",
  "/privacy",
  "/terms",
  "/delete-account"
];

export const ROBOTS_TXT = `User-agent: *
Allow: /

Disallow: /home
Disallow: /discover
Disallow: /chats
Disallow: /signals
Disallow: /profile
Disallow: /settings
Disallow: /hard
Disallow: /admin
Disallow: /onboarding
Disallow: /subscription
Disallow: /consultant
Disallow: /api

Sitemap: https://bamsignal.com/sitemap.xml
`;
