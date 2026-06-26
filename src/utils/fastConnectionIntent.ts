import { STORAGE_KEYS } from "../constants/limits";
import { syncMemberProfileRemote } from "../services/cityHome";
import type { IntentTag, UserProfile } from "../types";
import { activateFastConnectionEntitlements } from "./fastConnectionState";
import {
  activateQuickiePass,
  clearPendingQuickieIntent,
  hasPendingQuickieIntent,
  isQuickiePassActive,
  QUICKIE_INTENT
} from "./quickie";
import { sanitizeIntentsForActivePass } from "./quickieIntents";
import { getDatingProfile, normalizeDatingProfile } from "./profile";
import { writeJson } from "./storage";

export { sanitizeIntentsForActivePass } from "./quickieIntents";

export function applyQuickieIntentAfterPayment(
  user: Pick<UserProfile, "email" | "phone" | "name" | "username">,
  untilIso?: string,
  options?: { addIntent?: boolean }
): void {
  if (untilIso) {
    activateQuickiePass(untilIso);
    activateFastConnectionEntitlements(untilIso);
  }
  const profile = getDatingProfile();
  const shouldAddIntent =
    options?.addIntent !== undefined
      ? options.addIntent
      : hasPendingQuickieIntent() || profile.fastConnectionInterested === true;
  clearPendingQuickieIntent();
  if (!shouldAddIntent) {
    const interestedOnly = normalizeDatingProfile({
      ...profile,
      fastConnectionInterested: true
    });
    writeJson(STORAGE_KEYS.datingProfile, interestedOnly);
    void syncMemberProfileRemote(user, interestedOnly, { patchScope: "profile" });
    return;
  }

  let intents = [...profile.intents];
  if (!intents.includes(QUICKIE_INTENT)) {
    intents = [...intents, QUICKIE_INTENT];
  }

  const next = normalizeDatingProfile({
    ...profile,
    fastConnectionInterested: true,
    intents: sanitizeIntentsForActivePass(intents)
  });
  writeJson(STORAGE_KEYS.datingProfile, next);
  void syncMemberProfileRemote(user, next, { patchScope: "profile" });
}

export function applyPendingQuickieIntentIfNeeded(
  user: Pick<UserProfile, "email" | "phone" | "name" | "username">
): boolean {
  if (!hasPendingQuickieIntent() || !isQuickiePassActive()) return false;
  applyQuickieIntentAfterPayment(user);
  return true;
}

export function handleQuickieIntentTap(
  currentIntents: IntentTag[]
): "deselect" | "select" | "require_payment" | "blocked" {
  if (currentIntents.includes(QUICKIE_INTENT)) return "deselect";
  if (isQuickiePassActive()) return "select";
  return "require_payment";
}
