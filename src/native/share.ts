import { Share } from "@capacitor/share";
import { isNativeApp } from "./platform";

const APP_URL = "https://bamsignal.com";

export async function shareNativeProfile(profileName: string, profileId?: string): Promise<boolean> {
  const url = profileId ? `${APP_URL}/profile/${profileId}` : APP_URL;
  return shareNativeContent({
    title: `${profileName} on BamSignal`,
    text: `Check out ${profileName} on BamSignal — meaningful connections across Nigeria.`,
    url
  });
}

export async function shareNativeInvite(referralCode?: string): Promise<boolean> {
  const url = referralCode ? `${APP_URL}/referral/${referralCode}` : `${APP_URL}/signup`;
  return shareNativeContent({
    title: "Join me on BamSignal",
    text: "I'm on BamSignal — join with my invite link.",
    url
  });
}

export async function shareNativeReferralLink(code: string): Promise<boolean> {
  return shareNativeInvite(code);
}

export async function shareNativeContent(options: {
  title: string;
  text: string;
  url: string;
  dialogTitle?: string;
}): Promise<boolean> {
  if (!isNativeApp()) {
    if (navigator.share) {
      try {
        await navigator.share({ title: options.title, text: options.text, url: options.url });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  try {
    await Share.share({
      title: options.title,
      text: options.text,
      url: options.url,
      dialogTitle: options.dialogTitle || "Share via"
    });
    return true;
  } catch {
    return false;
  }
}
