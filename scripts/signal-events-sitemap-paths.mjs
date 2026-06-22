/** Signal Events™ indexable landing paths — keep in sync with globalCityNetwork.ts */
export const SIGNAL_EVENTS_HUB_PATHS = [
  "/events",
  "/events/communities",
  "/events/diaspora",
  "/events/community-journey"
];

export const SIGNAL_EVENTS_FEATURED_CITY_SLUGS = [
  "lagos",
  "abuja",
  "enugu",
  "port-harcourt",
  "london",
  "manchester",
  "houston",
  "atlanta",
  "dallas",
  "toronto",
  "brampton",
  "dubai",
  "sydney"
];

export function getSignalEventsIndexablePaths() {
  const cityPaths = SIGNAL_EVENTS_FEATURED_CITY_SLUGS.map((slug) => `/events/${slug}`);
  return [...SIGNAL_EVENTS_HUB_PATHS, ...cityPaths];
}
