/** Official BamSignal social profiles — shared by site footer and email templates */
export const SOCIAL_LINKS = [
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/realbamsignal/"
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/realbamsignal/"
  },
  {
    id: "x",
    label: "X",
    href: "https://x.com/realbamsignal"
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/bamsignal/"
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@realbamsignal"
  }
] as const;

export type SocialPlatformId = (typeof SOCIAL_LINKS)[number]["id"];
