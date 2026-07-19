/** Pass 4 — shared commercial experience copy (no new products). */

export const COMMERCIAL_BRAND = "BamSignal Commerce";

export const COMMERCIAL_PRODUCT_LABELS = {
  discover: "Discover Membership",
  discreet: "Discreet Membership",
  boost: "Profile Boost",
  conversation_unlock: "Conversation Unlock",
  concierge_invoice: "Concierge invoice",
  consultation_fee: "Consultation fee",
  fast_connection: "Fast Connection"
} as const;

export const COMMERCIAL_CHECKOUT = {
  preparing: "Preparing secure checkout…",
  opening: "Opening checkout…",
  failed: "We couldn't start checkout. Please try again."
} as const;

export const COMMERCIAL_RECEIPT = {
  title: "Receipt",
  paid: "Paid",
  pending: "Pending",
  failed: "Not confirmed",
  membershipNote: "Membership products are activated by Commerce. Invoices never change membership."
} as const;

export const COMMERCIAL_OUTCOME = {
  successTitle: "Payment confirmed",
  successBody: "Your purchase is recorded. Taking you back…",
  failureTitle: "Payment not confirmed",
  failureBody: "We couldn't verify this payment yet. You can try again when you're ready.",
  processingTitle: "Processing payment",
  processingBody: "Your payment succeeded. Finalizing your purchase…",
  verifyingTitle: "Confirming payment",
  verifyingBody: "Please wait a moment…"
} as const;

export const COMMERCIAL_DASHBOARD = {
  title: "Account & purchases",
  subtitle: "Membership, boosts, unlocks, invoices, and payment history — one place.",
  upcomingExpiries: "Upcoming expiries",
  history: "Transaction history",
  emptyHistory: "Purchases and invoices appear here after checkout.",
  openDiscover: "Manage Discover Membership",
  openDiscreet: "Manage Discreet Membership",
  openInvoices: "Concierge invoices & payments"
} as const;

export const DISCOVER_MEMBERSHIP_INCLUDES_TITLE = "Included with Discover Membership";
