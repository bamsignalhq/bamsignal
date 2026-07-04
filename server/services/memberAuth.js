import { findAppUserIdentity, normalizeUserKey } from "../db.js";
import { verifySupabaseBearerUser } from "../supabaseEnv.js";
import { resolveIdentityFromUserId } from "./onboardingRepair.js";

export const PUBLIC_MEMBER_DATA_ACTIONS = new Set([
  "profile-by-id",
  "subscription-catalog"
]);

function normalizePhone(value = "") {
  return String(value).replace(/\D/g, "").replace(/^234/, "");
}

function pickString(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
}

export function extractBearerToken(req) {
  const authHeader = String(req?.headers?.authorization || "");
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
}

function normalizeBodyIdentity(body = {}) {
  return {
    email: String(body.email || "").trim().toLowerCase(),
    phone: normalizePhone(body.phone),
    username: String(body.username || "")
      .trim()
      .toLowerCase()
      .replace(/^@+/, ""),
    userKey: String(body.userKey || body.user_key || "").trim(),
    userId: String(body.userId || body.user_id || "").trim(),
    profileId: String(body.profileId || body.profile_id || "").trim()
  };
}

/** Reject when body asserts a different principal than the verified token. */
export function hasBodyIdentityMismatch(body = {}, auth = {}) {
  const supplied = normalizeBodyIdentity(body);

  if (supplied.email && auth.email && supplied.email !== auth.email) return true;
  if (supplied.phone && auth.phone && supplied.phone !== auth.phone) return true;
  if (supplied.username && auth.username && supplied.username !== auth.username) return true;
  if (supplied.userKey && auth.userKey && supplied.userKey !== auth.userKey) return true;
  if (supplied.userId && auth.authUserId && supplied.userId !== auth.authUserId) return true;

  if (
    auth.memberId &&
    supplied.profileId &&
    !body.targetProfileId &&
    !body.recipientProfileId &&
    supplied.profileId !== auth.memberId
  ) {
    return true;
  }

  return false;
}

export function isPublicMemberDataAction(action = "") {
  return PUBLIC_MEMBER_DATA_ACTIONS.has(String(action || "").trim());
}

export async function tryOptionalMemberAuth(req, body = {}) {
  const bearer = extractBearerToken(req);
  if (!bearer) return null;
  const result = await requireMemberAuth(req, body);
  return result.ok ? result : null;
}

/**
 * Verify Supabase bearer token and resolve BamSignal member identity server-side.
 * Never trust email/phone/username from the request body.
 */
export async function requireMemberAuth(req, body = {}) {
  const bearer = extractBearerToken(req);
  if (!bearer) {
    return { ok: false, status: 401, error: "not_authorized" };
  }

  const authUser = await verifySupabaseBearerUser(bearer);
  if (!authUser?.id) {
    return { ok: false, status: 401, error: "not_authorized" };
  }

  const resolved = await resolveIdentityFromUserId(authUser.id, {
    email: authUser.email,
    phone: authUser.phone,
    username: authUser.username
  });

  const email = pickString(resolved.resolvedEmail, resolved.member?.email, authUser.email, resolved.appUser?.email)
    .trim()
    .toLowerCase();
  const phone = normalizePhone(
    pickString(resolved.resolvedPhone, resolved.member?.phone, authUser.phone, resolved.appUser?.phone)
  );
  const username = pickString(
    resolved.resolvedUsername,
    resolved.member?.username,
    resolved.member?.profile?.username,
    authUser.username
  )
    .trim()
    .toLowerCase()
    .replace(/^@+/, "");
  const userKey = normalizeUserKey({ email, phone });
  const member = resolved.member || null;
  const appUser = resolved.appUser || (email || phone ? await findAppUserIdentity({ email, phone }) : null);
  const memberId = member?.id ? String(member.id) : null;
  const name = pickString(member?.name, appUser?.name, authUser.name, body.name);

  const auth = {
    authUserId: authUser.id,
    email,
    phone,
    username,
    userKey,
    memberId,
    profile: member?.profile && typeof member.profile === "object" ? member.profile : null,
    member,
    appUser,
    identity: { email, phone, name, username }
  };

  if (hasBodyIdentityMismatch(body, auth)) {
    return { ok: false, status: 403, error: "not_authorized" };
  }

  if (!email && !phone) {
    return { ok: false, status: 404, error: "not_authorized" };
  }

  return { ok: true, ...auth };
}
