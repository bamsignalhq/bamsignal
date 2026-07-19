/** PROGRAM 002 — First-time user journey and education registry (BamSignal client). */

export type ProfileMilestoneUnlock = "trust_score" | "visibility" | "recommendations" | "rewards";

export type FirstTimeTeachTopicId =
  | "signals"
  | "likes"
  | "messaging"
  | "wallet"
  | "baygold"
  | "premium"
  | "boosts"
  | "safety";

export type MemberEmptySurfaceId =
  | "inbox"
  | "discover"
  | "wallet"
  | "notifications"
  | "rewards"
  | "receipts";

export type WelcomeRewardCampaignId =
  | "complete_profile"
  | "verify_phone"
  | "verify_email"
  | "upload_four_photos"
  | "receive_baygold";

export const FIRST_TIME_MISSION =
  "Understand BamSignal and get value within 5 minutes — complete your profile, send your first Signal, start a conversation.";

export const NEW_USER_JOURNEY_STEPS = [
  "Install App",
  "Welcome",
  "Create Account",
  "Verify Email",
  "Verify Phone",
  "Complete Profile",
  "Upload Photos",
  "Choose Interests",
  "Choose Preferences",
  "Trust Score Introduction",
  "Discovery Tutorial",
  "First Signal",
  "First Conversation"
] as const;

export const FIRST_TIME_TEACH_TOPICS: {
  id: FirstTimeTeachTopicId;
  title: string;
  summary: string;
}[] = [
  { id: "signals", title: "Signals", summary: "Signals show intentional interest — mutual Signals unlock chat." },
  { id: "likes", title: "Likes", summary: "Likes are a light touch; Signals move conversations forward." },
  { id: "messaging", title: "Messaging", summary: "Chat opens after a mutual connection." },
  { id: "wallet", title: "Wallet", summary: "Fund BayGold once, spend on Premium and Boosts." },
  { id: "baygold", title: "BayGold", summary: "In-app currency for purchases and welcome rewards." },
  { id: "premium", title: "Premium", summary: "Priority visibility and unlimited likes." },
  { id: "boosts", title: "Boosts", summary: "Short visibility bursts to reach more people." },
  { id: "safety", title: "Safety", summary: "Report and block — every report is reviewed." }
];

export const MEMBER_EMPTY_STATES: Record<
  MemberEmptySurfaceId,
  { title: string; body: string; actionLabel?: string }
> = {
  inbox: {
    title: "Your inbox is ready",
    body: "When someone accepts your Signal, the conversation appears here.",
    actionLabel: "Go to Discover"
  },
  discover: {
    title: "We're still gathering people near you",
    body: "New members join every day. Try expanding distance, adjusting preferences, or coming back later — your Signal will wait.",
    actionLabel: "Adjust preferences"
  },
  wallet: {
    title: "No transactions yet",
    body: "Fund BayGold once — use it for Premium, Boosts, and Signals from your Wallet.",
    actionLabel: "Buy BayGold"
  },
  notifications: {
    title: "No notifications yet",
    body: "Signals, matches, and safety alerts appear here as you connect."
  },
  rewards: {
    title: "Earn welcome BayGold",
    body: "Complete your profile, verify your phone, and upload photos to unlock rewards.",
    actionLabel: "Complete profile"
  },
  receipts: {
    title: "No receipts yet",
    body: "Wallet purchases appear here with full BayGold history."
  }
};

export const WELCOME_REWARD_CAMPAIGNS: {
  id: WelcomeRewardCampaignId;
  label: string;
  rewardBayGold: number;
  enabled: boolean;
  trigger: string;
}[] = [
  {
    id: "complete_profile",
    label: "Complete Profile",
    rewardBayGold: 50,
    enabled: true,
    trigger: "profile strength 100%"
  },
  {
    id: "verify_phone",
    label: "Verify Phone",
    rewardBayGold: 25,
    enabled: true,
    trigger: "phone verification complete"
  },
  {
    id: "verify_email",
    label: "Verify Email",
    rewardBayGold: 10,
    enabled: true,
    trigger: "email confirmed"
  },
  {
    id: "upload_four_photos",
    label: "Upload 4 Photos",
    rewardBayGold: 30,
    enabled: true,
    trigger: "4+ signup photos"
  },
  {
    id: "receive_baygold",
    label: "Receive BayGold",
    rewardBayGold: 0,
    enabled: true,
    trigger: "sum of eligible campaigns"
  }
];
