import { findAppUserIdentity } from "../db.js";

export function buildPaymentAuditIdentity({
  memberAuth = null,
  email = "",
  phone = "",
  body = {}
} = {}) {
  const normalizedEmail = String(
    memberAuth?.email || email || body.email || ""
  )
    .trim()
    .toLowerCase();
  const normalizedPhone = String(memberAuth?.phone || phone || body.phone || "")
    .replace(/\D/g, "")
    .replace(/^234/, "");

  return {
    userId: memberAuth?.authUserId || memberAuth?.memberId || body.userId || body.user_id || null,
    authUserId: memberAuth?.authUserId || null,
    profileId: memberAuth?.memberId || body.profileId || body.profile_id || null,
    userEmail: normalizedEmail.includes("@") ? normalizedEmail : null,
    userKey: memberAuth?.userKey || null,
    phone: normalizedPhone || null
  };
}

export async function resolvePaymentAuditIdentity({
  memberAuth = null,
  email = "",
  phone = "",
  body = {}
} = {}) {
  const base = buildPaymentAuditIdentity({ memberAuth, email, phone, body });
  if (base.userId || base.profileId) {
    return base;
  }
  const lookupEmail = base.userEmail || String(email || "").trim().toLowerCase();
  const lookupPhone = base.phone || String(phone || "").replace(/\D/g, "").replace(/^234/, "");
  if (!lookupEmail && !lookupPhone) {
    return base;
  }
  const appUser = await findAppUserIdentity({ email: lookupEmail, phone: lookupPhone });
  if (!appUser?.id) {
    return base;
  }
  return {
    ...base,
    profileId: base.profileId || appUser.id || null
  };
}
