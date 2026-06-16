import { getCms } from "../constants/cms";
import { EXPERIENCE_COPY, MONETIZATION_COPY } from "../constants/copy";
import { boostDisplayName } from "../constants/boosts";
import { pushNotification } from "./notifications";

export function notifySignalReceived(_name?: string): void {
  pushNotification({
    type: "signal_received",
    title: EXPERIENCE_COPY.notificationSignalReceivedTitle,
    body: getCms().notificationTemplates.signalReceived
  });
}

export function notifySignalAccepted(_name: string): void {
  pushNotification({
    type: "signal_accepted",
    title: EXPERIENCE_COPY.notificationSignalAcceptedTitle,
    body: EXPERIENCE_COPY.notificationSignalAcceptedBody
  });
}

export function notifyNewConversation(): void {
  pushNotification({
    type: "signal_accepted",
    title: EXPERIENCE_COPY.notificationSignalAcceptedTitle,
    body: EXPERIENCE_COPY.notificationSignalAcceptedBody
  });
}

export function notifyNewMessage(_name?: string): void {
  pushNotification({
    type: "signal_accepted",
    title: EXPERIENCE_COPY.notificationNewMessageTitle,
    body: EXPERIENCE_COPY.notificationNewMessageBody
  });
}

export function notifyProfileViewed(): void {
  pushNotification({
    type: "profile_viewed",
    title: EXPERIENCE_COPY.notificationProfileViewedTitle,
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
    title: MONETIZATION_COPY.paymentSuccessTitle,
    body: getCms().notificationTemplates.premiumActivated
  });
}

export function notifyBoostActivated(productId: string): void {
  const name = boostDisplayName(productId as Parameters<typeof boostDisplayName>[0]);
  pushNotification({
    type: "boost_activated",
    title: `${name} is live`,
    body: "Your profile has extra visibility in Discover."
  });
}

export function notifyReferralRewardEarned(days: number): void {
  pushNotification({
    type: "referral_reward",
    title: "Referral reward earned",
    body: `${days} days of Signal Pass added to your account.`
  });
}
