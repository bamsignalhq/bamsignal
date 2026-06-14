export const BRAND = {
  name: "BamSignal",
  headline: "Meet people who match your vibe.",
  subheadline: "Dating, friendship, and meaningful connections with verified people nearby.",
  trustLine: "Verified profiles. Safer chats. No stories.",
  tagline: "Real people.\nReal vibes.\nNo stories.",
  cta: "Discover Signals",
  nearbySignals: "Nearby Signals",
  premiumCta: "Upgrade your signal",
  paywallTitle: "Go Premium",
  paywallBody: "",
  contactBlockMessage:
    "Couldn't send — keep numbers inside BamSignal for now. Try again without digits.",
  contactTelegramBlocked:
    "Couldn't send — we'll ask if they're comfortable chatting off-app first.",
  contactRetryHint: "Message not sent. Edit and try again.",
  chatSafetyNotice:
    "To protect everyone, contact exchange is blocked until trust is built.",
  signalSent: "Signal Sent",
  signalAccepted: "Signal Accepted",
  sendSignal: "Send Signal",
  ignore: "Ignore",
  prioritySignal: "Priority Signal",
  inbox: "Inbox",
  likes: "Likes",
  signalsReceived: "Signals Received",
  signalsSent: "Signals Sent"
} as const;

export const LANDING = {
  heroHeadline: "Meet someone real in your city.",
  heroSubheadline:
    "Verified profiles, safer chats, and connections that start with a signal — from Lagos rooftops to Sunday hangouts.",
  finalHeadline: "Someone nearby might signal you today.",
  finalFooter: "5 free signals daily.\n5 free messages daily."
} as const;

export function greetingForHour(hour = new Date().getHours()): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
