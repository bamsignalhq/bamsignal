/** Official BamSignal social profiles — shared by site footer and email templates */
export const SOCIAL_LINKS = [
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
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/realbamsignal/"
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@realbamsignal"
  }
] as const;

export type SocialPlatformId = (typeof SOCIAL_LINKS)[number]["id"];
