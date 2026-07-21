/** Canonical institutional design tokens — one team, one console. */

export const INSTITUTIONAL_BUTTON_PRIMARY =
  "concierge-consultant-btn concierge-consultant-btn--primary";
export const INSTITUTIONAL_BUTTON_GHOST = "concierge-consultant-btn concierge-consultant-btn--ghost";
export const INSTITUTIONAL_BUTTON = "concierge-consultant-btn";

export const INSTITUTIONAL_CARD = "concierge-consultant-card--glass cc-reveal";
export const INSTITUTIONAL_CARD_HEAD = "concierge-consultant-card__head";

export const INSTITUTIONAL_PAGE = "institutional-page";
export const INSTITUTIONAL_PAGE_HEAD = "institutional-page__head";
export const INSTITUTIONAL_PAGE_BODY = "institutional-page__body";
export const INSTITUTIONAL_PAGE_ACTIONS = "institutional-page__actions";
export const INSTITUTIONAL_PAGE_FOOT = "institutional-page__foot";

export const MEMBER_BUTTON_PRIMARY = "btn-primary";
export const MEMBER_BUTTON_SECONDARY = "btn-secondary";
export const MEMBER_BUTTON_GHOST = "btn-ghost";
export const MEMBER_CARD = "member-card card";
export const MEMBER_ROOT = "platform-root--member";
export const MEMBER_SHEET_SCRIM = "member-ux-sheet__scrim";
export const MEMBER_SHEET_PANEL = "member-ux-sheet__panel";

/** PROGRAM 001 M2 — surfaces that must use MemberUxKit primitives. */
export const MEMBER_UX_SURFACES = [
  "auth",
  "discover",
  "chats",
  "signals",
  "profile",
  "wallet",
  "premium",
  "settings",
  "notifications",
  "payment-return"
] as const;

export const UX_STANDARDIZATION_TARGETS = [
  { surface: "Institutional admin", button: INSTITUTIONAL_BUTTON, card: INSTITUTIONAL_CARD },
  { surface: "Member app", button: MEMBER_BUTTON_PRIMARY, card: MEMBER_CARD, locked: true },
  { surface: "Public marketing", button: "landing-cta", card: "seo-card", locked: true }
] as const;

export const UX_DUPLICATE_COMPONENTS = [
  {
    id: "legacy-family-card",
    paths: [
      "src/components/admin/concierge/LegacyFamilyCard.tsx",
      "src/components/signalConcierge/LegacyFamilyCard.tsx"
    ],
    reason: "Context-specific layouts — member vs admin glass card. Intentional divergence."
  },
  {
    id: "document-search",
    paths: ["src/components/admin/documents/SearchCard.tsx"],
    reason: "DocumentSearchBar removed — SearchCard is canonical document filter."
  }
] as const;

export const UX_PARALLEL_STATUS_BADGES = [
  "institutional-status-badge",
  "security-status-badge",
  "health-status-badge",
  "integrity-status-badge",
  "consultation-status-badge",
  "payment-status-badge",
  "notification-status-badge",
  "delivery-status-badge",
  "whatsapp-status-badge",
  "legacy-status-badge",
  "support-status-badge"
] as const;
