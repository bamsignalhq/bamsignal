import { RECENT_ACTIVITY } from "../data/landingProfiles";

export type DashboardFeedItem = {
  id: string;
  text: string;
};

export function buildDashboardFeed(input: {
  profileViewCount: number;
  city: string;
  verified: boolean;
  signalsReceived: number;
}): DashboardFeedItem[] {
  const items: DashboardFeedItem[] = [];

  if (input.profileViewCount > 0) {
    items.push({ id: "view", text: "Someone viewed your profile" });
  }

  if (input.signalsReceived > 0) {
    items.push({
      id: "signal",
      text: `${input.signalsReceived} new signal${input.signalsReceived === 1 ? "" : "s"} waiting for you`
    });
  }

  items.push({ id: "member", text: `New member joined in ${input.city}` });

  const searches = Math.max(12, input.profileViewCount * 3 + 8);
  items.push({
    id: "searches",
    text: `Your profile appeared in ${searches} searches`
  });

  if (input.verified) {
    items.push({ id: "verified", text: "Verification approved" });
  }

  for (const entry of RECENT_ACTIVITY) {
    if (items.length >= 6) break;
    items.push({ id: `live-${entry}`, text: entry });
  }

  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.text)) return false;
    seen.add(item.text);
    return true;
  });
}
