/** Signal Pass / subscription — never conflate with one-time boosts. */

export function resolveSignalPassStatus(user) {
  if (!user) {
    return { isPremium: false, premiumUntil: null };
  }

  const untilRaw = user.premium_until || user.premiumUntil || null;
  const untilMs = untilRaw ? new Date(untilRaw).getTime() : 0;
  const active = Number.isFinite(untilMs) && untilMs > Date.now();

  return {
    isPremium: active,
    premiumUntil: active ? new Date(untilMs).toISOString() : null
  };
}

export function resolveFastConnectionPassStatus(user) {
  if (!user) {
    return { active: false, expiresAt: null };
  }

  const untilRaw = user.fast_connection_pass_until || user.fastConnectionPassUntil || null;
  const untilMs = untilRaw ? new Date(untilRaw).getTime() : 0;
  const active = Number.isFinite(untilMs) && untilMs > Date.now();

  return {
    active,
    expiresAt: active ? new Date(untilMs).toISOString() : null
  };
}

export function shouldClearStalePremiumFlag(user) {
  if (!user?.is_premium) return false;
  const untilRaw = user.premium_until || user.premiumUntil || null;
  if (!untilRaw) return true;
  return new Date(untilRaw).getTime() <= Date.now();
}

export function shouldClearStaleFastConnectionFlag(user) {
  const untilRaw = user.fast_connection_pass_until || user.fastConnectionPassUntil || null;
  if (!untilRaw) return false;
  return new Date(untilRaw).getTime() <= Date.now();
}
