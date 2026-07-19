export const MARKETING_INFRASTRUCTURE_MISSION =
  "Build the systems that support growth before spending on marketing.";

export type MarketingCampaignKind =
  | "launch"
  | "weekend"
  | "holiday"
  | "referral";

export type MarketingContentHubId =
  | "landing"
  | "faq"
  | "blog"
  | "success_stories"
  | "safety_articles";

export type MarketingShareKind = "profile" | "referral" | "success_story";

export const REFERRAL_REWARD_RULES = {
  goal: 3,
  rewardDays: 7,
  rewardLabel: "7-day Discover Membership",
} as const;

export const MARKETING_CAMPAIGN_TEMPLATES: {
  id: string;
  kind: MarketingCampaignKind;
  title: string;
  summary: string;
  cta: string;
}[] = [
  {
    id: "launch-nigeria",
    kind: "launch",
    title: "Nigeria Launch",
    summary: "Founding member invite wave across Lagos, Abuja, and PH.",
    cta: "Join BamSignal",
  },
  {
    id: "weekend-discover",
    kind: "weekend",
    title: "Weekend Discover",
    summary: "Friday–Sunday boost for new signals and profile views.",
    cta: "Discover this weekend",
  },
  {
    id: "holiday-love",
    kind: "holiday",
    title: "Holiday Connections",
    summary: "Seasonal campaigns for Valentine's, Eid, and December.",
    cta: "Find your person",
  },
  {
    id: "referral-wave",
    kind: "referral",
    title: "Referral Wave",
    summary: "Invite 3 friends — earn Discover Membership rewards.",
    cta: "Share your code",
  },
];

export const MARKETING_CONTENT_HUBS: {
  id: MarketingContentHubId;
  label: string;
  path: string;
  summary: string;
}[] = [
  { id: "landing", label: "Landing Pages", path: "/", summary: "Marketing home and city pages" },
  { id: "faq", label: "FAQs", path: "/faq", summary: "Help and onboarding answers" },
  { id: "blog", label: "Blog", path: "/blog", summary: "Guides and relationship content" },
  {
    id: "success_stories",
    label: "Success Stories",
    path: "/signal-concierge/share-your-story",
    summary: "Member stories with consent",
  },
  { id: "safety_articles", label: "Safety Articles", path: "/safety", summary: "Trust and safety SEO hub" },
];

export const MARKETING_SEO_CAPABILITIES = [
  "Public marketing pages indexed",
  "Per-page title, description, canonical",
  "Open Graph + Twitter card previews",
  "JSON-LD: Article, FAQ, WebPage, Place, Breadcrumb",
] as const;

export const MARKETING_SHARE_ACTIONS: {
  id: MarketingShareKind;
  label: string;
  description: string;
}[] = [
  { id: "profile", label: "Share Profile", description: "Share your public profile link" },
  { id: "referral", label: "Share Referral", description: "Invite friends with your code" },
  {
    id: "success_story",
    label: "Share Success Story",
    description: "Celebrate a connection (with consent)",
  },
];
