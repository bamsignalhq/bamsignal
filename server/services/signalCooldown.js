import { isDatabaseReady, query } from "../db.js";
import { findMemberProfileByUserKey } from "../cityHome.js";
import {
  CAPABILITY,
  canFromSnapshot,
  loadMembershipEntitlements
} from "./membershipEntitlements.js";
import { FREE_TIER_LIMITS } from "../../shared/membershipCapabilities.mjs";

export async function assertSignalCooldown({ email, phone }) {
  if (!isDatabaseReady()) return { ok: true };

  const sender = await findMemberProfileByUserKey(email, phone);
  if (!sender?.user_key) return { ok: true };

  const entitlements = await loadMembershipEntitlements({ email, phone });
  const cooldownMs = canFromSnapshot(entitlements, CAPABILITY.REDUCED_SIGNAL_COOLDOWN)
    ? FREE_TIER_LIMITS.premiumSignalCooldownMs
    : FREE_TIER_LIMITS.signalCooldownMs;

  const result = await query(
    `select created_at from app_signals
     where user_key = $1
     order by created_at desc
     limit 1`,
    [sender.user_key]
  );
  const lastAt = result.rows[0]?.created_at;
  if (!lastAt) return { ok: true, entitlements };

  const elapsed = Date.now() - new Date(lastAt).getTime();
  if (elapsed < cooldownMs) {
    return {
      ok: false,
      error: "Please slow down a little.",
      cooldown: true,
      retryAfterMs: cooldownMs - elapsed
    };
  }
  return {
    ok: true,
    entitlements,
    premium: canFromSnapshot(entitlements, CAPABILITY.REDUCED_SIGNAL_COOLDOWN)
  };
}
