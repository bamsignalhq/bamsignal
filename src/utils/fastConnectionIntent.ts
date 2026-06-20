import { MAX_INTENT_SELECTIONS } from "../constants/intents";
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
import { getDatingProfile, normalizeDatingProfile } from "./profile";
import { writeJson } from "./storage";

/** Remove unpaid Fast Connection intent — pass must be active to keep Quickie on profile. */
export function sanitizeIntentsForActivePass(intents: IntentTag[]): IntentTag[] {
  if (isQuickiePassActive()) return intents;
  const filtered = intents.filter((intent) => intent !== QUICKIE_INTENT);
  if (filtered.length) return filtered;
  return intents.includes(QUICKIE_INTENT) ? ["Relationship"] : filtered;
}

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
    void syncMemberProfileRemote(user, interestedOnly);
    return;
  }

  let intents = [...profile.intents];
  if (!intents.includes(QUICKIE_INTENT)) {
    if (intents.length >= MAX_INTENT_SELECTIONS) {
      intents = [...intents.slice(0, MAX_INTENT_SELECTIONS - 1), QUICKIE_INTENT];
    } else {
      intents = [...intents, QUICKIE_INTENT];
    }
  }

  const next = normalizeDatingProfile({
    ...profile,
    fastConnectionInterested: true,
    intents: sanitizeIntentsForActivePass(intents)
  });
  writeJson(STORAGE_KEYS.datingProfile, next);
  void syncMemberProfileRemote(user, next);
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
  if (currentIntents.length >= MAX_INTENT_SELECTIONS) return "blocked";
  if (isQuickiePassActive()) return "select";
  return "require_payment";
}
