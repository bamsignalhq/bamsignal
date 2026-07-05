import { shareNativeContent, shareNativeInvite, shareNativeProfile } from "../native/share";
import { trackEvent } from "./analytics";
import { referralShareUrl } from "./referrals";

export async function shareMemberProfile(profileName: string, profileId?: string): Promise<boolean> {
  trackEvent("share_profile", { profileId: profileId ?? "self" });
  return shareNativeProfile(profileName, profileId);
}

export async function shareMemberReferral(code: string): Promise<boolean> {
  trackEvent("share_referral", { code });
  const shared = await shareNativeInvite(code);
  if (!shared && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(referralShareUrl(code));
      return true;
    } catch {
      return false;
    }
  }
  return shared;
}

export async function shareSuccessStory(headline: string, storyUrl?: string): Promise<boolean> {
  const url = storyUrl ?? "https://bamsignal.com/signal-concierge/share-your-story";
  trackEvent("share_success_story", { headline: headline.slice(0, 80) });
  return shareNativeContent({
    title: "A BamSignal story",
    text: headline,
    url,
    dialogTitle: "Share success story",
  });
}
