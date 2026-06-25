/** Founder Acceptance Test™ — persona and workflow registry. */

import type { FatPersonaId, FatWorkflowId } from "../types/founderAcceptance";

export const FAT_PERSONAS: { id: FatPersonaId; label: string }[] = [
  { id: "guest", label: "Guest" },
  { id: "registered-member", label: "Registered Member" },
  { id: "premium-member", label: "Premium Member" },
  { id: "concierge-member", label: "Concierge Member" },
  { id: "consultant", label: "Consultant" },
  { id: "senior-matchmaker", label: "Senior Matchmaker" },
  { id: "operations", label: "Operations" },
  { id: "support", label: "Support" },
  { id: "research", label: "Research" },
  { id: "executive", label: "Executive" },
  { id: "super-admin", label: "Super Admin" }
];

export const FAT_WORKFLOWS: { id: FatWorkflowId; label: string; testScript?: string }[] = [
  { id: "discovery", label: "Discovery & public pages", testScript: "test:route-audit" },
  { id: "auth", label: "Auth (username + PIN)", testScript: "test:member-data-auth" },
  { id: "onboarding", label: "Onboarding", testScript: "test:open-app-onboarding" },
  { id: "member-app", label: "Member app shell", testScript: "test:member-dashboard" },
  { id: "premium", label: "Premium & subscription", testScript: "test:payments" },
  { id: "payments", label: "Paystack payments", testScript: "test:fortress" },
  { id: "concierge", label: "Signal Concierge apply", testScript: "test:operations-center" },
  { id: "scheduling", label: "Calendar booking", testScript: "test:scheduling" },
  { id: "meetings", label: "Meetings", testScript: "test:meetings" },
  { id: "assignments", label: "Consultant assignment", testScript: "test:assignment-engine" },
  { id: "introductions", label: "Introductions", testScript: "test:introduction-engine" },
  { id: "follow-up", label: "Relationship follow-up", testScript: "test:relationship-follow-up" },
  { id: "archive", label: "Journey archive", testScript: "test:journey-archive" },
  { id: "notifications", label: "Notifications", testScript: "test:notification-operations" },
  { id: "consultant-portal", label: "Consultant portal", testScript: "test:consultation-review" },
  { id: "operations-center", label: "Operations center", testScript: "test:operations-center" },
  { id: "support", label: "Support center", testScript: "test:support-center" },
  { id: "research", label: "Journey intelligence", testScript: "test:journey-intelligence" },
  { id: "executive", label: "Executive dashboard", testScript: "test:executive-dashboard" },
  { id: "admin", label: "Admin hub", testScript: "test:permissions" },
  { id: "permissions", label: "Permissions & roles", testScript: "test:permissions-audit" },
  { id: "reporting", label: "Reporting center", testScript: "test:reporting-center" },
  { id: "exports", label: "Exports", testScript: "test:reporting-center" },
  { id: "search", label: "Search & discover", testScript: "test:member-dashboard" },
  { id: "seo", label: "SEO & public indexing", testScript: "test:launch-infrastructure" },
  { id: "infrastructure", label: "Deploy infrastructure", testScript: "test:launch-infrastructure" }
];

export const FAT_KNOWN_WARNINGS = [
  "Apple Team ID placeholder (TEAMID) in apple-app-site-association — replace before iOS Universal Links verify",
  "Optional concierge integrations (Sendchamp, Google Calendar, Zoom) need Coolify runtime secrets",
  "Gzip/Brotli compression at reverse proxy — not duplicated in Express",
  "SEO word-count warnings on short public pages — informational only"
] as const;

export const FAT_GO_LABELS = {
  go: "GO",
  "go-with-conditions": "GO WITH CONDITIONS",
  "no-go": "NO GO"
} as const;

export const FAT_FIXES_APPLIED = [
  "Route audit uses ENFORCED_HARD_ROUTE_PATHS for admin tab permission coverage",
  "Founder Acceptance Test™ dashboard at /hard/founder-acceptance",
  "Automated FAT runner: npm run test:founder-acceptance",
  "Certification suite (75 scripts) integrated into FAT verification"
] as const;

export const FAT_PERSONA_WORKFLOW_MAP: Record<FatPersonaId, FatWorkflowId[]> = {
  guest: ["discovery", "seo", "auth"],
  "registered-member": ["auth", "onboarding", "member-app", "discovery", "notifications"],
  "premium-member": ["member-app", "premium", "payments", "notifications"],
  "concierge-member": ["concierge", "scheduling", "meetings", "payments", "notifications"],
  consultant: ["consultant-portal", "scheduling", "meetings", "introductions", "follow-up"],
  "senior-matchmaker": ["consultant-portal", "assignments", "introductions", "follow-up", "archive"],
  operations: ["operations-center", "assignments", "scheduling", "notifications", "admin"],
  support: ["support", "notifications", "member-app"],
  research: ["research", "archive", "reporting"],
  executive: ["executive", "reporting", "exports"],
  "super-admin": ["admin", "permissions", "infrastructure", "reporting", "exports"]
};
