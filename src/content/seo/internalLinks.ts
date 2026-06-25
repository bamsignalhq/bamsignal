import type { SeoHubId } from "./seoPages";
import { AUTH_SIGNUP_PATH } from "../../constants/routes";

export type SeoLinkItem = { href: string; label: string };

const HELP_RELATED: Record<string, SeoLinkItem[]> = {
  "create-profile": [
    { href: "/help/photos", label: "Profile photos" },
    { href: "/help/signals", label: "How signals work" },
    { href: "/help/verification", label: "Verification" }
  ],
  signals: [
    { href: "/help/messages", label: "Messages and chats" },
    { href: "/help/create-profile", label: "Create your profile" }
  ],
  messages: [
    { href: "/help/signals", label: "How signals work" },
    { href: "/help/contact-exchange", label: "Contact exchange" }
  ]
};

const SAFETY_RELATED: Record<string, SeoLinkItem[]> = {
  "meeting-safely": [
    { href: "/safety/avoid-romance-scams", label: "Avoid romance scams" },
    { href: "/safety/contact-exchange", label: "Contact exchange safety" },
    { href: "/safety/blocking-users", label: "Blocking users" }
  ],
  "avoid-romance-scams": [
    { href: "/safety/never-send-money", label: "Money pressure from matches" },
    { href: "/safety/reporting-abuse", label: "Reporting abuse" }
  ],
  "reporting-abuse": [
    { href: "/safety/blocking-users", label: "Blocking users" },
    { href: "/safety/privacy", label: "Privacy controls" }
  ]
};

const COMPARE_LINKS: SeoLinkItem[] = [
  { href: "/features/signals", label: "How signals work" },
  { href: "/features/discover", label: "Discover" },
  { href: "/safety/meeting-safely", label: "Meeting safely" },
  { href: "/premium/signal-pass", label: "Signal Pass" }
];

const CITY_LINKS: SeoLinkItem[] = [
  { href: "/features/signals", label: "How signals work" },
  { href: "/safety/meeting-safely", label: "Meeting safely" },
  { href: "/help/create-profile", label: "Create your profile" },
  { href: AUTH_SIGNUP_PATH, label: "Join BamSignal" }
];

export function getSeoInternalLinks(hubId: SeoHubId, slug: string): SeoLinkItem[] {
  if (hubId === "help") {
    return [
      ...(HELP_RELATED[slug] ?? [{ href: "/help/create-profile", label: "Create your profile" }]),
      { href: "/safety", label: "Safety centre" },
      { href: AUTH_SIGNUP_PATH, label: "Join BamSignal" }
    ];
  }
  if (hubId === "safety") {
    return [
      ...(SAFETY_RELATED[slug] ?? [{ href: "/safety/meeting-safely", label: "Meeting safely" }]),
      { href: "/safety/reporting-abuse", label: "Reporting abuse" },
      { href: AUTH_SIGNUP_PATH, label: "Join BamSignal" }
    ];
  }
  if (hubId === "compare") return COMPARE_LINKS;
  if (hubId === "cities") return CITY_LINKS;
  if (hubId === "guides" || hubId === "premium" || hubId === "features") {
    return [
      { href: "/features/signals", label: "How signals work" },
      { href: "/safety/meeting-safely", label: "Meeting safely" },
      { href: AUTH_SIGNUP_PATH, label: "Join BamSignal" }
    ];
  }
  return [{ href: AUTH_SIGNUP_PATH, label: "Join BamSignal" }];
}
