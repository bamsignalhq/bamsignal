/** UX & design consistency audit — domains and remediation inventory. */

import type { UxDomainId, UxStatusId } from "../types/uxConsistency";

export const UX_AUDIT_DOMAINS = [
  { id: "typography", label: "Typography" },
  { id: "spacing", label: "Spacing" },
  { id: "buttons", label: "Buttons" },
  { id: "cards", label: "Cards" },
  { id: "tables", label: "Tables" },
  { id: "forms", label: "Forms" },
  { id: "icons", label: "Icons" },
  { id: "animations", label: "Animations" },
  { id: "loading-states", label: "Loading States" },
  { id: "skeletons", label: "Skeletons" },
  { id: "error-states", label: "Error States" },
  { id: "success-states", label: "Success States" },
  { id: "dialogs", label: "Dialogs" },
  { id: "modals", label: "Modals" },
  { id: "mobile-layout", label: "Mobile Layout" },
  { id: "desktop-layout", label: "Desktop Layout" },
  { id: "accessibility", label: "Accessibility" },
  { id: "dark-theme", label: "Dark Theme" },
  { id: "light-theme", label: "Light Theme" },
  { id: "navigation", label: "Navigation" },
  { id: "breadcrumbs", label: "Breadcrumbs" },
  { id: "page-titles", label: "Page Titles" },
  { id: "consistency", label: "Consistency" }
] as const;

export const UX_DOMAIN_LABELS: Record<UxDomainId, string> = Object.fromEntries(
  UX_AUDIT_DOMAINS.map((item) => [item.id, item.label])
) as Record<UxDomainId, string>;

export const UX_STATUSES = [
  { id: "consistent", label: "Consistent" },
  { id: "review", label: "Needs Review" },
  { id: "inconsistent", label: "Inconsistent" }
] as const;

export const UX_STATUS_LABELS: Record<UxStatusId, string> = Object.fromEntries(
  UX_STATUSES.map((item) => [item.id, item.label])
) as Record<UxStatusId, string>;

export const UX_STANDARDIZATION_FIXES = [
  "Shared institutional-page shell for audit dashboards",
  "InstitutionalStatusBadge — canonical status chip for new centers",
  "concierge-consultant-btn standardized on institutional pages",
  "concierge-consultant-card--glass cc-reveal standardized card surface",
  "Removed unused DocumentSearchBar component and dead CSS",
  "Security dashboard migrated to institutional-page shell",
  "uxDesignSystem.ts documents member vs admin token boundaries",
  "Member UI frozen — compact fintech tokens preserved in member-fintech.css"
] as const;
