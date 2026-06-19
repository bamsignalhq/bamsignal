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

export const SEO_DETAIL_PATHS = [
  "/cities/lagos",
  "/help/create-profile",
  "/safety/meeting-safely",
  "/features/signals",
  "/premium/signal-pass",
  "/faq/getting-started",
  "/guides/conversation-starters",
  "/compare/bamsignal-vs-tinder"
];

export const LEGAL_STATIC_PATHS = [
  "/about",
  "/safety-policy",
  "/privacy",
  "/terms",
  "/contact",
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

Sitemap: https://bamsignal.com/sitemap.xml
`;
