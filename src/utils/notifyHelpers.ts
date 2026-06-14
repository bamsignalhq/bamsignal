import { getCms } from "../constants/cms";
import { pushNotification } from "./notifications";

export function notifySignalReceived(name?: string): void {
  const cms = getCms();
  pushNotification({
    type: "signal_received",
    title: "New signal",
    body: name ? `${name} sent you a signal ⚡` : cms.notificationTemplates.signalReceived
  });
}

export function notifySignalAccepted(name: string): void {
  pushNotification({
    type: "signal_accepted",
    title: "Signal accepted",
    body: `${name} accepted your signal — open Inbox to chat`
  });
}

export function notifyProfileViewed(): void {
  pushNotification({
    type: "profile_viewed",
    title: "Profile view",
    body: getCms().notificationTemplates.profileViewed
  });
}

export function notifyVerificationApproved(): void {
  pushNotification({
    type: "verification_approved",
    title: "Verified",
    body: getCms().notificationTemplates.verificationApproved
  });
}

export function notifyPremiumActivated(): void {
  pushNotification({
    type: "premium_activated",
    title: "Signal Pass active",
    body: getCms().notificationTemplates.premiumActivated
  });
}

export function notifyBoostActivated(productName: string): void {
  pushNotification({
    type: "boost_activated",
    title: "Boost active",
    body: `${productName} is live — your profile is bumped in Discover.`
  });
}

export function notifyReferralRewardEarned(days: number): void {
  pushNotification({
    type: "referral_reward",
    title: "Referral reward earned",
    body: `${days} days of Signal Pass added to your account.`
  });
}
