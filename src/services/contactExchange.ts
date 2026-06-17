import type {
  ContactExchangeShared,
  ContactExchangeState,
  ContactExchangeStatus,
  UserProfile
} from "../types";
import { apiUrl } from "./supabase";
import { readResponseJson } from "../utils/httpJson";

type ExchangePayload = {
  ok?: boolean;
  error?: string;
  limitReached?: boolean;
  exchange?: ContactExchangeState | null;
  entitlements?: {
    policy: { freeLimit: number; windowDays: number };
    premium: boolean;
    completedInWindow: number;
    remainingFree: number | null;
    unlimited: boolean;
  };
  role?: "requester" | "recipient" | null;
};

async function postExchange(
  user: Pick<UserProfile, "email" | "phone">,
  action: string,
  body: Record<string, unknown> = {}
) {
  const response = await fetch(apiUrl(`/api/member/data?action=${action}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: user.email, phone: user.phone, ...body })
  });
  return readResponseJson<ExchangePayload>(response);
}

export function contactExchangeAllowsSharing(status?: ContactExchangeStatus) {
  return status === "accepted" || status === "completed";
}

export async function fetchContactExchangeState(
  user: Pick<UserProfile, "email" | "phone">,
  matchId: string
) {
  return postExchange(user, "contact-exchange-state", { matchId });
}

export async function requestContactExchangeRemote(
  user: Pick<UserProfile, "email" | "phone">,
  matchId: string,
  recipientProfileId: string,
  requesterProfileId?: string
) {
  return postExchange(user, "contact-exchange-request", {
    matchId,
    recipientProfileId,
    requesterProfileId
  });
}

export async function respondContactExchangeRemote(
  user: Pick<UserProfile, "email" | "phone">,
  matchId: string,
  accept: boolean,
  profileId?: string
) {
  return postExchange(user, "contact-exchange-respond", { matchId, accept, profileId });
}

export async function completeContactExchangeRemote(
  user: Pick<UserProfile, "email" | "phone">,
  matchId: string,
  sharedContacts: ContactExchangeShared,
  profileId?: string
) {
  return postExchange(user, "contact-exchange-complete", { matchId, sharedContacts, profileId });
}

export async function cancelContactExchangeRemote(
  user: Pick<UserProfile, "email" | "phone">,
  matchId: string,
  profileId?: string
) {
  return postExchange(user, "contact-exchange-cancel", { matchId, profileId });
}

export function mapServerExchange(row: Record<string, unknown> | null | undefined): ContactExchangeState | undefined {
  if (!row) return undefined;
  const status = String(row.status || "") as ContactExchangeStatus;
  if (!status) return undefined;
  return {
    status,
    requesterUserKey: String(row.requester_user_key || row.requesterUserKey || "") || undefined,
    recipientUserKey: String(row.recipient_user_key || row.recipientUserKey || "") || undefined,
    requestedAt: (row.requested_at || row.requestedAt) as string | undefined,
    respondedAt: (row.responded_at || row.respondedAt) as string | undefined,
    acceptedAt: (row.accepted_at || row.acceptedAt) as string | undefined,
    completedAt: (row.completed_at || row.completedAt) as string | undefined,
    sharedContacts: (row.shared_contacts || row.sharedContacts) as ContactExchangeState["sharedContacts"]
  };
}
