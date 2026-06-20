import type { UserProfile } from "../types";
import { apiUrl } from "./supabase";
import { memberApiHeaders } from "../utils/memberApiAuth";
import { readResponseJson } from "../utils/httpJson";

async function postMemberTrust(
  user: Pick<UserProfile, "email" | "phone">,
  action: string,
  body: Record<string, unknown> = {}
) {
  const response = await fetch(apiUrl(`/api/member/data?action=${action}`), {
    method: "POST",
    headers: await memberApiHeaders(),
    body: JSON.stringify({ email: user.email, phone: user.phone, ...body })
  });
  return readResponseJson<Record<string, unknown>>(response);
}

export type MemberAccountState = {
  accountStatus?: string;
  accountDeletedAt?: string | null;
  accountDeleteScheduledFor?: string | null;
  profilePausedAt?: string | null;
  profilePauseReason?: string | null;
  usernameLastChangedAt?: string | null;
  usernameChangeCount?: number;
  discoverable?: boolean;
};

export async function fetchAccountStateRemote(user: Pick<UserProfile, "email" | "phone">) {
  const payload = await postMemberTrust(user, "account-state");
  return (payload?.account as MemberAccountState | undefined) ?? null;
}

export async function checkUsernameRemote(
  user: Pick<UserProfile, "email" | "phone">,
  username: string,
  excludeProfileId?: string
) {
  const response = await fetch(apiUrl("/api/member/data?action=check-username"), {
    method: "POST",
    headers: await memberApiHeaders(),
    body: JSON.stringify({
      email: user.email,
      phone: user.phone,
      username,
      excludeProfileId
    })
  });
  return readResponseJson<{ ok?: boolean; available?: boolean; error?: string }>(response);
}

export async function changeUsernameRemote(
  user: Pick<UserProfile, "email" | "phone" | "username">,
  username: string
) {
  const payload = await postMemberTrust(user, "change-username", { username });
  return Boolean(payload?.ok);
}

export async function pauseProfileRemote(user: Pick<UserProfile, "email" | "phone">, reason?: string) {
  const payload = await postMemberTrust(user, "pause-profile", { reason });
  return Boolean(payload?.ok);
}

export async function unpauseProfileRemote(user: Pick<UserProfile, "email" | "phone">) {
  const payload = await postMemberTrust(user, "unpause-profile");
  return Boolean(payload?.ok);
}

export async function softDeleteAccountRemote(user: Pick<UserProfile, "email" | "phone">) {
  const payload = await postMemberTrust(user, "soft-delete-account");
  return payload;
}

export async function restoreAccountRemote(user: Pick<UserProfile, "email" | "phone">) {
  const payload = await postMemberTrust(user, "restore-account");
  return Boolean(payload?.ok);
}

export async function saveConnectionNoteRemote(
  user: Pick<UserProfile, "email" | "phone">,
  targetProfileId: string,
  note: string
) {
  const payload = await postMemberTrust(user, "connection-note", { targetProfileId, note });
  return Boolean(payload?.ok);
}

export async function fetchConnectionNoteRemote(
  user: Pick<UserProfile, "email" | "phone">,
  targetProfileId: string
) {
  const payload = await postMemberTrust(user, "connection-note", { targetProfileId, readOnly: true });
  return (payload?.note as { note?: string } | null) ?? null;
}

export async function submitSuccessStoryRemote(
  user: Pick<UserProfile, "email" | "phone">,
  story: string,
  anonymous = true
) {
  const payload = await postMemberTrust(user, "success-story", { story, anonymous });
  return Boolean(payload?.ok);
}

export async function reportModerationFlagRemote(
  user: Pick<UserProfile, "email" | "phone">,
  reason: string,
  metadata: Record<string, unknown> = {},
  profileId?: string
) {
  const payload = await postMemberTrust(user, "moderation-flag", { reason, metadata, profileId });
  return Boolean(payload?.ok);
}
