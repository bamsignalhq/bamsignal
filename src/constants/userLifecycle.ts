export const USER_LIFECYCLE_MISSION =
  "Every user should have a complete lifecycle from signup to becoming a long-term advocate.";

export type LifecycleStage =
  | "visitor"
  | "registered"
  | "verified"
  | "profile_complete"
  | "active"
  | "engaged"
  | "premium"
  | "ambassador"
  | "dormant"
  | "reactivated";

export const LIFECYCLE_STAGES: { id: LifecycleStage; label: string; percent: number }[] = [
  { id: "visitor", label: "Visitor", percent: 0 },
  { id: "registered", label: "Registered", percent: 10 },
  { id: "verified", label: "Verified", percent: 20 },
  { id: "profile_complete", label: "Profile Complete", percent: 35 },
  { id: "active", label: "Active", percent: 50 },
  { id: "engaged", label: "Engaged", percent: 65 },
  { id: "premium", label: "Premium", percent: 80 },
  { id: "ambassador", label: "Ambassador", percent: 90 },
  { id: "dormant", label: "Dormant", percent: 15 },
  { id: "reactivated", label: "Reactivated", percent: 60 },
];

export type LifecycleMilestoneId =
  | "signup"
  | "phone_verification"
  | "selfie_verification"
  | "profile_strength"
  | "first_signal"
  | "first_conversation"
  | "first_purchase"
  | "first_referral";

export const LIFECYCLE_MILESTONES: { id: LifecycleMilestoneId; label: string }[] = [
  { id: "signup", label: "Signed up" },
  { id: "phone_verification", label: "Phone verified" },
  { id: "selfie_verification", label: "Selfie verified" },
  { id: "profile_strength", label: "Profile complete" },
  { id: "first_signal", label: "First signal sent" },
  { id: "first_conversation", label: "First conversation started" },
  { id: "first_purchase", label: "First purchase" },
  { id: "first_referral", label: "First referral" },
];

export type LifecycleRecommendedActionId =
  | "verify_phone"
  | "complete_profile"
  | "start_discover"
  | "start_conversation"
  | "introduce_wallet"
  | "upgrade_premium"
  | "share_referral"
  | "reengage";

export const RECOMMENDED_ACTIONS: Record<
  LifecycleRecommendedActionId,
  { label: string; description: string; path?: string }
> = {
  verify_phone: {
    label: "Verify phone",
    description: "Phone verification unlocks trust and better discovery.",
    path: "/trusted-member",
  },
  complete_profile: {
    label: "Complete your profile",
    description: "Add photos, bio, interests, and visibility settings.",
    path: "/profile",
  },
  start_discover: {
    label: "Start discovering",
    description: "Send your first signal to begin meaningful connections.",
    path: "/discover",
  },
  start_conversation: {
    label: "Start a conversation",
    description: "Reply quickly to build momentum and trust.",
    path: "/chats",
  },
  introduce_wallet: {
    label: "Explore Wallet & BayGold",
    description: "Unlock boosts and Signal Pass with BayGold.",
    path: "/profile",
  },
  upgrade_premium: {
    label: "Upgrade to Signal Pass",
    description: "Premium increases discovery, safety, and limits.",
    path: "/subscription",
  },
  share_referral: {
    label: "Share your referral code",
    description: "Invite friends and earn Signal Pass rewards.",
    path: "/referral",
  },
  reengage: {
    label: "Come back for new matches",
    description: "Restart discovery and see who joined since you left.",
    path: "/discover",
  },
};

