/** Accessibility Certification™ — verified domain registry. */

export const ACCESSIBILITY_CERT_DOMAINS = [
  { id: "keyboard-navigation", label: "Keyboard Navigation" },
  { id: "focus-order", label: "Focus Order" },
  { id: "aria-labels", label: "ARIA Labels" },
  { id: "color-contrast", label: "Color Contrast" },
  { id: "screen-readers", label: "Screen Readers" },
  { id: "touch-targets", label: "Touch Targets" },
  { id: "reduced-motion", label: "Reduced Motion" },
  { id: "form-labels", label: "Form Labels" },
  { id: "error-messaging", label: "Error Messaging" },
  { id: "modal-focus-trapping", label: "Modal Focus Trapping" }
];

export const ACCESSIBILITY_CERT_BLOCK_ON_CRITICAL = true;

export const ACCESSIBILITY_CERT_MEMBER_MODALS = [
  "src/components/ComplianceGateModal.tsx",
  "src/components/PricingModal.tsx",
  "src/components/CoverPhotoCropModal.tsx",
  "src/components/AuthModal.tsx",
  "src/components/home/HomeQuickFilterSheet.tsx",
  "src/components/ProfileDetailSheet.tsx"
];

export const ACCESSIBILITY_CERT_RELEASE_BLOCKERS = [
  "Critical accessibility failure on member auth or modal surfaces",
  "Login UI exposes password terminology instead of PIN",
  "Required modals missing aria-modal dialog semantics"
];
