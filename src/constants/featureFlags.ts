/** User-facing referral UI — off until launch campaign is ready */
export const ENABLE_REFERRALS_UI =
  String(import.meta.env.VITE_ENABLE_REFERRALS_UI ?? "false").toLowerCase() === "true";
