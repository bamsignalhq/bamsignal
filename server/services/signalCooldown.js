import { isDatabaseReady, query } from "../db.js";
import { findMemberProfileByUserKey } from "../cityHome.js";

const FREE_COOLDOWN_MS = 15_000;
const PREMIUM_COOLDOWN_MS = 5_000;

async function senderIsPremium(userKey) {
  if (!userKey || !isDatabaseReady()) return false;
  const result = await query(
    `select premium_until from app_users where user_key = $1 limit 1`,
    [userKey]
  );
  const until = result.rows[0]?.premium_until;
  return until ? new Date(until).getTime() > Date.now() : false;
}

export async function assertSignalCooldown({ email, phone }) {
  if (!isDatabaseReady()) return { ok: true };

  const sender = await findMemberProfileByUserKey(email, phone);
  if (!sender?.user_key) return { ok: true };

  const premium = await senderIsPremium(sender.user_key);
  const cooldownMs = premium ? PREMIUM_COOLDOWN_MS : FREE_COOLDOWN_MS;

  const result = await query(
    `select created_at from app_signals
     where user_key = $1
     order by created_at desc
     limit 1`,
    [sender.user_key]
  );
  const lastAt = result.rows[0]?.created_at;
  if (!lastAt) return { ok: true };

  const elapsed = Date.now() - new Date(lastAt).getTime();
  if (elapsed < cooldownMs) {
    return {
      ok: false,
      error: "Please slow down a little.",
      cooldown: true,
      retryAfterMs: cooldownMs - elapsed
    };
  }
  return { ok: true, premium };
}
