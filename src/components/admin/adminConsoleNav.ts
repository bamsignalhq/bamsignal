export type AdminTab =
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
  | "leads";

export type AdminNavItem = {
  id: AdminTab;
  label: string;
  keywords: string[];
  badgeKey?: "reports" | "leads" | "verify";
};

export type AdminNavSection = {
  id: string;
  title: string;
  items: AdminNavItem[];
};

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

export const ADMIN_TAB_TITLES: Record<AdminTab, string> = {
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
  leads: "Leads"
};

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
