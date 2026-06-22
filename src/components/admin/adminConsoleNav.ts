export type HardTab =
  | "command"
  | "overview"
  | "business"
  | "users"
  | "reports"
  | "cities"
  | "discover"
  | "cityhome"
  | "pricing"
  | "verifications"
  | "content"
  | "email"
  | "ads"
  | "leads"
  | "concierge"
  | "talent"
  | "support"
  | "audit"
  | "documents"
  | "safety"
  | "academy"
  | "quality"
  | "finance";

/** @deprecated use HardTab */
export type AdminTab = HardTab;

export type HardNavItem = {
  id: HardTab;
  label: string;
  keywords: string[];
  badgeKey?: "reports" | "leads" | "verify";
};

export type AdminNavItem = HardNavItem;

export type HardNavSection = {
  id: string;
  title: string;
  items: HardNavItem[];
};

export type AdminNavSection = HardNavSection;

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    id: "operations",
    title: "OPERATIONS",
    items: [
      { id: "command", label: "COMMAND CENTER", keywords: ["command", "center", "moderation", "ops"] },
      { id: "overview", label: "Metrics", keywords: ["metrics", "overview", "stats", "analytics"] },
      { id: "business", label: "Business", keywords: ["business", "revenue", "funnel"] },
      { id: "users", label: "Users", keywords: ["users", "members", "delete", "purge"] },
      { id: "reports", label: "Reports", keywords: ["reports", "moderation", "flagged"], badgeKey: "reports" },
      { id: "leads", label: "Leads", keywords: ["leads", "waitlist"], badgeKey: "leads" },
      {
        id: "concierge",
        label: "Signal Concierge",
        keywords: ["concierge", "matchmaking", "consultant", "introductions"]
      },
      {
        id: "talent",
        label: "Talent",
        keywords: ["talent", "careers", "recruiting", "hiring", "candidates"]
      },
      {
        id: "support",
        label: "Support",
        keywords: ["support", "tickets", "help", "customer", "escalation"]
      },
      {
        id: "audit",
        label: "Audit",
        keywords: ["audit", "compliance", "trail", "permissions", "exports"]
      },
      {
        id: "documents",
        label: "Documents",
        keywords: ["documents", "policies", "procedures", "training", "repository", "templates"]
      },
      {
        id: "safety",
        label: "Safety",
        keywords: ["safety", "crisis", "incident", "harassment", "fraud", "threats", "escalation"]
      },
      {
        id: "academy",
        label: "Academy",
        keywords: ["academy", "training", "certification", "consultant", "learning", "modules"]
      },
      {
        id: "quality",
        label: "Quality",
        keywords: ["quality", "assurance", "review", "audit", "consultation", "improvement"]
      },
      {
        id: "finance",
        label: "Finance",
        keywords: ["finance", "revenue", "paystack", "payments", "refunds", "payouts", "settlements"]
      },
      {
        id: "verifications",
        label: "Verification",
        keywords: ["verify", "verification", "selfie", "kyc"],
        badgeKey: "verify"
      }
    ]
  },
  {
    id: "discovery",
    title: "DISCOVERY",
    items: [
      { id: "cities", label: "Cities", keywords: ["cities", "geo", "locations"] },
      { id: "discover", label: "Discover", keywords: ["discover", "launch", "seed"] },
      { id: "cityhome", label: "City Home", keywords: ["city", "home", "spotlight", "featured"] }
    ]
  },
  {
    id: "monetization",
    title: "MONETIZATION",
    items: [
      { id: "pricing", label: "Pricing", keywords: ["pricing", "premium", "plans", "paystack"] },
      { id: "ads", label: "Home Ads", keywords: ["ads", "home", "feed", "sponsored"] }
    ]
  },
  {
    id: "content",
    title: "CONTENT",
    items: [
      { id: "content", label: "Content", keywords: ["content", "cms", "copy", "hero"] },
      { id: "email", label: "Email", keywords: ["email", "branding", "banner"] }
    ]
  }
];

export const HARD_TAB_TITLES: Record<HardTab, string> = {
  command: "COMMAND CENTER",
  overview: "Metrics",
  business: "Business",
  users: "Users",
  reports: "Reports",
  cities: "Cities",
  discover: "Discover",
  cityhome: "City Home",
  pricing: "Pricing",
  verifications: "Verification",
  content: "Content",
  email: "Email",
  ads: "Home Ads",
  leads: "Leads",
  concierge: "Signal Concierge",
  talent: "Talent",
  support: "Support",
  audit: "Audit",
  documents: "Documents",
  safety: "Safety",
  academy: "Academy",
  quality: "Quality",
  finance: "Finance"
};

export const ADMIN_TAB_TITLES = HARD_TAB_TITLES;

export function filterAdminNavSections(query: string): AdminNavSection[] {
  const q = query.trim().toLowerCase();
  if (!q) return ADMIN_NAV_SECTIONS;

  return ADMIN_NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.id.includes(q) ||
        item.keywords.some((keyword) => keyword.includes(q) || q.includes(keyword)) ||
        section.title.toLowerCase().includes(q)
    )
  })).filter((section) => section.items.length > 0);
}
