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
  | "compliance"
  | "systemhealth"
  | "notifications"
  | "documents"
  | "policies"
  | "safety"
  | "academy"
  | "quality"
  | "finance"
  | "messages"
  | "executive"
  | "launch"
  | "remediation"
  | "readiness"
  | "dataintegrity"
  | "recovery"
  | "workforce"
  | "governance"
  | "businesscontinuity"
  | "configuration"
  | "monitoring"
  | "datagovernance"
  | "apiplatform"
  | "launchcontrol"
  | "performance"
  | "workflows"
  | "securitydashboard"
  | "uxconsistency"
  | "performanceoptimization"
  | "launchcertification"
  | "enterprisecleanup"
  | "productionenvironment"
  | "launchinfrastructure"
  | "founderacceptance"
  | "observability"
  | "featureflags"
  | "platformhealth"
  | "abuseprotection"
  | "search"
  | "disasterrecovery"
  | "launchcommand"
  | "qualityassurance"
  | "securityops"
  | "enterpriseapi";

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
      { id: "reports", label: "Reports", keywords: ["reports", "institutional", "export", "scheduled", "executive"], badgeKey: "reports" },
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
        id: "workforce",
        label: "Workforce",
        keywords: ["workforce", "capacity", "staffing", "leave", "transfer", "availability"]
      },
      {
        id: "support",
        label: "Support",
        keywords: ["support", "tickets", "help", "customer", "escalation"]
      },
      {
        id: "governance",
        label: "Governance",
        keywords: ["governance", "authority", "permissions", "roles", "approval", "delegation", "policy"]
      },
      {
        id: "configuration",
        label: "Configuration",
        keywords: ["configuration", "feature-flags", "runtime", "settings", "limits", "rollout", "versioning"]
      },
      {
        id: "featureflags",
        label: "Feature Flags",
        keywords: ["feature", "flags", "rollout", "toggle", "remote", "experiments", "beta", "launch"]
      },
      {
        id: "observability",
        label: "Observability",
        keywords: ["observability", "operations", "devops", "heartbeat", "latency", "errors", "deployments", "health", "monitoring"]
      },
      {
        id: "platformhealth",
        label: "Platform Health",
        keywords: ["platform", "health", "dependencies", "traffic-light", "morning", "uptime", "incidents", "alerts", "critical"]
      },
      {
        id: "abuseprotection",
        label: "Abuse Protection",
        keywords: ["abuse", "spam", "fraud", "otp", "rate-limit", "bot", "scraping", "trust", "safety", "block"]
      },
      {
        id: "search",
        label: "Search",
        keywords: ["search", "find", "command", "palette", "members", "journeys", "payments", "global", "discover"]
      },
      {
        id: "disasterrecovery",
        label: "Disaster Recovery",
        keywords: ["disaster", "recovery", "backup", "restore", "failover", "outage", "integrity", "snapshot"]
      },
      {
        id: "monitoring",
        label: "Monitoring",
        keywords: ["monitoring", "noc", "observability", "incidents", "alerts", "outages", "uptime", "metrics"]
      },
      {
        id: "datagovernance",
        label: "Data Governance",
        keywords: ["data", "governance", "privacy", "retention", "consent", "gdpr", "ndpr", "pii", "deletion"]
      },
      {
        id: "apiplatform",
        label: "API Platform",
        keywords: ["api", "platform", "webhooks", "integrations", "keys", "rate-limits", "endpoints", "clients"]
      },
      {
        id: "enterpriseapi",
        label: "API Ops",
        keywords: ["api", "operations", "endpoints", "latency", "errors", "rate limits", "openapi", "maintenance", "replay"]
      },
      {
        id: "audit",
        label: "Audit",
        keywords: ["audit", "compliance", "trail", "permissions", "exports"]
      },
      {
        id: "securityops",
        label: "Security Ops",
        keywords: ["security", "operations", "soc", "authentication", "brute-force", "sessions", "api-abuse", "incidents", "platform"]
      },
      {
        id: "securitydashboard",
        label: "Security",
        keywords: ["security", "hardening", "headers", "csrf", "xss", "rls", "secrets", "auth"]
      },
      {
        id: "uxconsistency",
        label: "UX Audit",
        keywords: ["ux", "design", "consistency", "typography", "spacing", "buttons", "cards", "theme"]
      },
      {
        id: "performanceoptimization",
        label: "Perf Optimize",
        keywords: ["performance", "bundle", "lazy", "cache", "lighthouse", "speed", "optimization"]
      },
      {
        id: "launchcertification",
        label: "Launch Cert",
        keywords: ["launch", "certification", "go", "no-go", "readiness", "certify", "tomorrow"]
      },
      {
        id: "enterprisecleanup",
        label: "Code Cleanup",
        keywords: ["cleanup", "engineering", "health", "dead-code", "duplicate", "maintainability", "refactor"]
      },
      {
        id: "productionenvironment",
        label: "Env Audit",
        keywords: ["environment", "env", "secrets", "supabase", "paystack", "resend", "integration", "coolify"]
      },
      {
        id: "launchinfrastructure",
        label: "Launch Infra",
        keywords: ["infrastructure", "docker", "sitemap", "robots", "pwa", "app-links", "assetlinks", "seo", "manifest"]
      },
      {
        id: "founderacceptance",
        label: "FAT",
        keywords: ["founder", "acceptance", "fat", "launch", "tomorrow", "walkthrough", "go", "no-go"]
      },
      {
        id: "compliance",
        label: "Compliance",
        keywords: ["compliance", "institutional", "audit", "regulatory", "governance", "timeline"]
      },
      {
        id: "systemhealth",
        label: "System Health",
        keywords: ["system", "health", "uptime", "monitoring", "dependencies", "incidents", "status"]
      },
      {
        id: "notifications",
        label: "Notifications",
        keywords: ["notifications", "email", "whatsapp", "push", "delivery", "queue", "retry", "templates", "audit", "enterprise"]
      },
      {
        id: "documents",
        label: "Document Center",
        keywords: ["documents", "document-center", "policies", "procedures", "training", "repository", "templates", "knowledge"]
      },
      {
        id: "policies",
        label: "Policies",
        keywords: ["policies", "acknowledgement", "policy", "compliance", "governance"]
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
        id: "messages",
        label: "Messages",
        keywords: ["messages", "messaging", "announcements", "escalation", "handoff", "internal"]
      },
      {
        id: "executive",
        label: "Executive",
        keywords: ["executive", "strategic", "founder", "board", "institution", "legacy", "growth"]
      },
      {
        id: "qualityassurance",
        label: "QA & Certification",
        keywords: ["qa", "quality", "assurance", "certification", "release", "gates", "regression", "manual", "automated", "pdf"]
      },
      {
        id: "launchcommand",
        label: "Launch Command",
        keywords: ["launch", "command", "go", "no-go", "100000", "readiness", "blockers", "executive", "capacity"]
      },
      {
        id: "launchcontrol",
        label: "Launch Control",
        keywords: ["launch", "control", "go-no-go", "readiness", "blockers", "timeline", "risks", "checklist"]
      },
      {
        id: "performance",
        label: "Performance",
        keywords: ["performance", "engineering", "lcp", "cls", "fid", "ttfb", "bundle", "startup", "latency", "web vitals", "slow queries"]
      },
      {
        id: "workflows",
        label: "Workflows",
        keywords: ["workflow", "automation", "triggers", "actions", "reminders", "assignments", "operational"]
      },
      {
        id: "launch",
        label: "Launch Readiness",
        keywords: ["launch", "readiness", "go-live", "institutional", "audit", "blocked", "critical"]
      },
      {
        id: "remediation",
        label: "Remediation Board",
        keywords: ["remediation", "findings", "audit", "blockers", "P0", "P1", "P2", "fix"]
      },
      {
        id: "readiness",
        label: "Readiness Report",
        keywords: ["readiness", "report", "aggregate", "audit", "go-no-go", "health", "score"]
      },
      {
        id: "dataintegrity",
        label: "Data Integrity",
        keywords: ["data", "integrity", "consistency", "journey", "assignments", "verification"]
      },
      {
        id: "recovery",
        label: "Recovery",
        keywords: ["recovery", "backup", "disaster", "resilience", "retention", "failover", "restore"]
      },
      {
        id: "businesscontinuity",
        label: "Business Continuity",
        keywords: ["continuity", "disaster", "recovery", "incident", "outage", "failover", "backup", "resilience"]
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
  securitydashboard: "Security",
  compliance: "Compliance",
  systemhealth: "System Health",
  notifications: "Notifications",
  documents: "Document Center",
  policies: "Policies",
  safety: "Safety",
  academy: "Academy",
  quality: "Quality",
  finance: "Finance",
  messages: "Messages",
  executive: "Executive",
  launch: "Launch Readiness",
  launchcontrol: "Launch Control",
  performance: "Performance",
  workflows: "Workflows",
  uxconsistency: "UX Audit",
  performanceoptimization: "Perf Optimize",
  launchcertification: "Launch Cert",
  enterprisecleanup: "Code Cleanup",
  productionenvironment: "Env Audit",
  launchinfrastructure: "Launch Infra",
  founderacceptance: "FAT",
  observability: "Observability",
  featureflags: "Feature Flags",
  platformhealth: "Platform Health",
  abuseprotection: "Abuse Protection",
  search: "Search",
  disasterrecovery: "Disaster Recovery",
  launchcommand: "Launch Command",
  qualityassurance: "QA & Certification",
  securityops: "Security Ops",
  enterpriseapi: "API Ops",
  remediation: "Remediation Board",
  readiness: "Readiness Report",
  dataintegrity: "Data Integrity",
  recovery: "Recovery",
  workforce: "Workforce",
  governance: "Governance",
  businesscontinuity: "Business Continuity",
  configuration: "Configuration",
  monitoring: "Monitoring",
  datagovernance: "Data Governance",
  apiplatform: "API Platform"
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
