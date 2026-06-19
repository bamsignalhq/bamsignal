import { findAppUserIdentity, isDatabaseReady, normalizeUserKey, query, upsertAppUserIdentity } from "../db.js";
import { ensureMemberProfilesTable } from "../cityHome.js";
import { normalizeSignupUsername, phoneDigitKeys } from "./signupIdentity.js";

export function normalizeLoginUsername(raw = "") {
  return normalizeSignupUsername(String(raw || "").trim().replace(/^@+/, ""));
}

function loginDebug(key, value) {
  console.info(`[login-debug] ${key}`, value);
}

function emailFromUserKey(userKey = "") {
  const key = String(userKey || "");
  if (!key.startsWith("email:")) return null;
  const email = key.slice(6).trim().toLowerCase();
  return email.includes("@") ? email : null;
}

function uniqueEmails(values = []) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    const email = String(value || "").trim().toLowerCase();
    if (!email.includes("@") || seen.has(email)) continue;
    seen.add(email);
    out.push(email);
  }
  return out;
}

async function findMemberByUsername(username) {
  if (!isDatabaseReady()) return null;
  await ensureMemberProfilesTable();
  const result = await query(
    `select id, user_key, email, phone, name, username, profile, onboarding_complete
     from app_member_profiles
     where lower(username) = lower($1)
     limit 1`,
    [username]
  );
  return result.rows[0] || null;
}

async function findAuthUserByPhone(phone) {
  const keys = phoneDigitKeys(phone);
  if (!keys.length || !isDatabaseReady()) return null;
  const result = await query(
    `select id, email, raw_user_meta_data
     from auth.users
     where coalesce(raw_user_meta_data->>'phone', '') <> ''
       and regexp_replace(coalesce(raw_user_meta_data->>'phone', ''), '\\D', '', 'g') = any($1::text[])
     limit 1`,
    [keys]
  );
  return result.rows[0] || null;
}

async function findAuthUserByUsername(username) {
  if (!isDatabaseReady()) return null;
  const result = await query(
    `select id, email, raw_user_meta_data
     from auth.users
     where raw_user_meta_data->>'username' is not null
       and raw_user_meta_data->>'username' <> ''
       and lower(raw_user_meta_data->>'username') = lower($1)
     limit 1`,
    [username]
  );
  return result.rows[0] || null;
}

async function repairMemberEmail(member, email) {
  if (!member?.id || !email || !isDatabaseReady()) return member;
  const normalized = String(email).trim().toLowerCase();
  if (!normalized.includes("@")) return member;

  const current = member.email ? String(member.email).trim().toLowerCase() : "";
  if (current === normalized) return member;

  await query(
    `update app_member_profiles
     set email = $2,
         user_key = coalesce(user_key, $3),
         updated_at = now()
     where id = $1`,
    [member.id, normalized, normalizeUserKey({ email: normalized, phone: member.phone })]
  );
  return { ...member, email: normalized };
}

async function repairAppUserLinkage({ email, phone, name }) {
  if (!email || !isDatabaseReady()) return null;
  return upsertAppUserIdentity({
    email: String(email).trim().toLowerCase(),
    phone: phone || null,
    name: name || null
  });
}

/** Same username source of truth as signup availability checks. */
export async function resolveLoginAccount(rawUsername = "") {
  const username = normalizeLoginUsername(rawUsername);
  loginDebug("normalizedUsername", username || "(empty)");

  if (!username) {
    return {
      username: "",
      email: null,
      emails: [],
      member: null,
      authUser: null,
      sourceTable: null,
      profileExists: false,
      usernameFound: false
    };
  }

  let member = await findMemberByUsername(username);
  const authUser = await findAuthUserByUsername(username);
  const emails = [];
  let sourceTable = null;

  if (member?.email) {
    emails.push(member.email);
    sourceTable = "app_member_profiles";
  }

  const userKeyEmail = emailFromUserKey(member?.user_key);
  if (userKeyEmail) {
    emails.push(userKeyEmail);
    sourceTable = sourceTable || "app_member_profiles.user_key";
  }

  if (member?.phone) {
    const appUser = await findAppUserIdentity({ email: null, phone: member.phone });
    if (appUser?.email) {
      emails.push(appUser.email);
      sourceTable = sourceTable || "app_users";
    }
    const authByPhone = await findAuthUserByPhone(member.phone);
    if (authByPhone?.email) {
      emails.push(authByPhone.email);
      sourceTable = sourceTable || "auth.users.phone";
    }
  }

  if (authUser?.email) {
    emails.push(authUser.email);
    sourceTable = sourceTable || "auth.users";
  }

  const resolvedEmails = uniqueEmails(emails);
  let email = resolvedEmails[0] || null;

  if (member && email && !member.email) {
    member = await repairMemberEmail(member, email);
  }

  if (email) {
    await repairAppUserLinkage({
      email,
      phone: member?.phone || authUser?.raw_user_meta_data?.phone || null,
      name: member?.name || authUser?.raw_user_meta_data?.name || null
    });
  }

  const usernameFound = Boolean(member || authUser);
  loginDebug("usernameFound", usernameFound);
  loginDebug("sourceTable", sourceTable);
  loginDebug("profileExists", Boolean(member?.id));

  return {
    username,
    email,
    emails: resolvedEmails,
    member,
    authUser,
    sourceTable,
    profileExists: Boolean(member?.id),
    usernameFound
  };
}
