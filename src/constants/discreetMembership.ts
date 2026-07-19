/**
 * Discreet Membership product constants (Pass 2).
 * Activation remains Commerce-owned; this file is display/catalog only.
 */

export const DISCREET_PLAN_ID = "monthly";
export const DISCREET_PRODUCT_ID = "discreet";
export const DISCREET_PRICE_NGN = 9999;
export const DISCREET_DURATION_DAYS = 30;

export const DISCREET_PLAN = Object.freeze({
  id: DISCREET_PLAN_ID,
  productId: DISCREET_PRODUCT_ID,
  name: "Monthly Discreet Membership",
  price: DISCREET_PRICE_NGN,
  priceLabel: `₦${DISCREET_PRICE_NGN.toLocaleString("en-NG")}`,
  days: DISCREET_DURATION_DAYS,
  amountKobo: DISCREET_PRICE_NGN * 100
});

export const DISCREET_BENEFITS = Object.freeze([
  {
    id: "unlimited-signals",
    label: "Unlimited Signals",
    summary: "Send Signals without the free daily cap."
  },
  {
    id: "unlimited-messaging",
    label: "Unlimited Messaging",
    summary: "Chat freely once a conversation is open."
  },
  {
    id: "premium-discover",
    label: "Premium Discover experience",
    summary: "Browse, search, and use premium Discover capabilities."
  },
  {
    id: "hidden-profile",
    label: "Hidden profile",
    summary:
      "Hidden from Discover, Search, Nearby, Suggestions, Recommendations, and People You May Like."
  },
  {
    id: "you-initiate",
    label: "You initiate contact",
    summary: "Others see you only after you Signal or start a conversation."
  }
]);

export const DISCREET_STILL_ALLOWED = Object.freeze([
  "Browse Discover",
  "Search manually",
  "Send Signals",
  "Chat in open conversations",
  "Keep existing matches"
]);
