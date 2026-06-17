export const BRAND = {
  name: "BamSignal",
  headline: "Meaningful connections, one signal at a time.",
  subheadline: "Friendship, companionship, and genuine relationships with verified people nearby.",
  trustLine: "Verified profiles. Safer chats. No stories.",
  tagline: "Real people.\nReal vibes.\nNo stories.",
  cta: "Discover Signals",
  nearbySignals: "Nearby Signals",
  premiumCta: "Get Signal Pass",
  paywallTitle: "Signal Pass",
  paywallBody: "Connect without limits.",
  contactBlockMessage:
    "We couldn't save that information. Please try something different.",
  contactTelegramBlocked:
    "We couldn't save that information. Please try something different.",
  contactRetryHint: "",
  chatSafetyNotice:
    "To protect everyone, contact exchange is blocked until trust is built.",
  signalSent: "Signal sent",
  signalSentSub: "",
  signalAccepted: "Signal accepted ❤️",
  signalAcceptedSub: "You can now start chatting.",
  matchCreated: "It's a Signal ❤️",
  matchCreatedSub: "Say hello and take things one conversation at a time.",
  sendSignal: "Send Signal",
  ignore: "Ignore",
  prioritySignal: "Priority Introduction",
  inbox: "Chats",
  likes: "Likes",
  signalsReceived: "Signals Received",
  signalsSent: "Signals Sent"
} as const;

export const SUCCESS_COPY = {
  welcomeTitle: "Welcome to BamSignal ❤️",
  welcomeBody:
    "Your profile is ready. Discover genuine people around you and take things one signal at a time.",
  profileVisitorsTitle: "People Interested In You",
  profileVisitorsLocked: "People Interested In You 🔒",
  profileVisitorsSubtitle: "Someone may already be noticing you ❤️",
  profileVisitorsPaywallHint: "See who's been checking out your profile.",
  profileVisitorsCount: (count: number) =>
    `${count} ${count === 1 ? "person" : "people"} checked out your profile this week`,
  homeFeedEmpty: "People are joining every day ❤️",
  homeFeedEmptyHint: "Take your time and discover genuine connections.",
  searchEmpty: "Nothing here yet ❤️",
  searchEmptyHint: "Try adjusting your filters to meet more people.",
  discoverEmpty: "Explore beyond your usual preferences.",
  discoverEmptyHint: "New people join every day — check back soon.",
  discoverFilterEmpty: "No one fits this filter yet.",
  discoverFilterEmptyHint: "Try another filter or widen your preferences.",
  profileShine: "Make Your Profile Shine ✨",
  peopleNearYou: "People Near You",
  emptyPremiumState: "Someone may already be noticing you ❤️"
} as const;

export const BUTTON_COPY = {
  continue: "Continue",
  save: "Save",
  done: "Done",
  explore: "Explore",
  sendSignal: "Send Signal",
  getSignalPass: "Get Signal Pass"
} as const;

export const ERROR_COPY = {
  tryAgain: "We couldn't do that right now. Please try again.",
  tryAgainSoon: "Something went wrong. Please try again shortly.",
  signalFailed: "We couldn't send your signal right now. Please try again."
} as const;

export const EXPERIENCE_COPY = {
  chatsTitle: "Chats",
  searchConversations: "Search conversations",
  chatEmptyTitle: "Nothing here yet ❤️",
  chatEmptyBody: "Great conversations often begin with one signal.",
  chatMatchBanner: "It's a Signal ❤️",
  chatMatchHint: "Say hello and take things one conversation at a time.",
  chatNewPreview: "Start the conversation",
  safetyMenuTitle: "You're in control",
  safetyMenuLead: "Take a moment — you can report, block, or unmatch at any time.",
  reportUser: "Report user",
  blockUser: "Block user",
  unmatch: "Unmatch",
  notificationSignalReceivedTitle: "Signal received ❤️",
  notificationSignalReceivedBody: "Someone is interested in getting to know you.",
  notificationSignalAcceptedTitle: "Someone felt the vibe ❤️",
  notificationSignalAcceptedBody: "You can now start chatting.",
  notificationNewMessageTitle: "New message",
  notificationNewMessageBody: "You have a new message.",
  notificationProfileViewedTitle: "Profile viewed",
  notificationProfileViewedBody: "Someone noticed your profile."
} as const;

export const MONETIZATION_COPY = {
  getSignalPass: "Get Signal Pass",
  checkoutLoading: "Preparing secure checkout...",
  paymentSuccessTitle: "Welcome to Signal Pass ❤️",
  paymentSuccessBody: "Enjoy unlimited connections.",
  paymentCancelledTitle: "No worries ❤️",
  paymentCancelledBody: "Your upgrade is still available whenever you're ready.",
  lockedFeature: "Included with Signal Pass 🔒",
  seeEveryone: "See Everyone",
  signalsExhaustedTitle: "No Signals left",
  signalsExhaustedHint: "Signal Pass lets you keep connecting."
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
