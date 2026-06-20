import type { DiscoverProfile, UserProfile } from "../types";
import type { FastSignalStatus } from "../utils/fastSignals";
import { syncFastSignalStatusFromServer } from "../utils/fastSignals";
import { syncFastConnectionPassFromServer } from "../utils/quickie";
import { memberApiHeaders } from "../utils/memberApiAuth";
import { readResponseJson } from "../utils/httpJson";
import { apiUrl } from "./supabase";

type PoolResponse = {
  ok?: boolean;
  passActive?: boolean;
  profiles?: DiscoverProfile[];
  locationTier?: "city" | "state" | "none";
  error?: string;
};

type StatusResponse = FastSignalStatus & {
  ok?: boolean;
  error?: string;
};

type HistoryResponse = {
  ok?: boolean;
  purchases?: Array<{
    id: string;
    productLabel: string;
    activatedAt: string;
    expiresAt: string | null;
    status: "Active" | "Expired";
  }>;
};

type SignalResponse = {
  ok?: boolean;
  error?: string;
  limitReached?: boolean;
  usedToday?: number;
  dailyLimit?: number;
  remaining?: number;
  resetAt?: string | null;
};

export async function fetchFastConnectionPool(
  user: Pick<UserProfile, "email" | "phone">,
  excludeProfileIds: string[] = []
): Promise<{
  ok: boolean;
  passActive: boolean;
  profiles: DiscoverProfile[];
  locationTier: "city" | "state" | "none";
  error?: string;
}> {
  try {
    const response = await fetch(apiUrl("/api/member/data?action=fast-connection-pool"), {
      method: "POST",
      headers: await memberApiHeaders(),
      body: JSON.stringify({
        email: user.email,
        phone: user.phone,
        excludeProfileIds
      })
    });
    const payload = await readResponseJson<PoolResponse>(response);
    if (!response.ok || !payload?.ok) {
      return {
        ok: false,
        passActive: Boolean(payload?.passActive),
        profiles: [],
        locationTier: "none",
        error: payload?.error || "Could not load Fast Connection matches."
      };
    }
    return {
      ok: true,
      passActive: Boolean(payload.passActive),
      profiles: Array.isArray(payload.profiles) ? payload.profiles : [],
      locationTier: payload.locationTier || "none"
    };
  } catch {
    return {
      ok: false,
      passActive: false,
      profiles: [],
      locationTier: "none",
      error: "Could not load Fast Connection matches."
    };
  }
}

export async function fetchFastConnectionSignalStatus(
  user: Pick<UserProfile, "email" | "phone">
): Promise<FastSignalStatus & { ok: boolean; error?: string }> {
  try {
    const response = await fetch(apiUrl("/api/member/data?action=fast-connection-status"), {
      method: "POST",
      headers: await memberApiHeaders(),
      body: JSON.stringify({
        email: user.email,
        phone: user.phone
      })
    });
    const payload = await readResponseJson<StatusResponse>(response);
    if (!response.ok || !payload?.ok) {
      return {
        ok: false,
        passActive: false,
        usedToday: 0,
        dailyLimit: 30,
        remaining: 0,
        resetAt: null,
        error: payload?.error || "Could not load Fast Signal status."
      };
    }
    const synced = syncFastSignalStatusFromServer(payload);
    syncFastConnectionPassFromServer(synced.expiresAt, synced.passActive);
    return { ok: true, ...synced };
  } catch {
    return {
      ok: false,
      passActive: false,
      usedToday: 0,
      dailyLimit: 30,
      remaining: 0,
      resetAt: null,
      error: "Could not load Fast Signal status."
    };
  }
}

export async function sendFastConnectionSignalRemote(
  user: Pick<UserProfile, "email" | "phone">,
  targetProfileId: string
): Promise<{
  ok: boolean;
  error?: string;
  limitReached?: boolean;
  status: FastSignalStatus;
}> {
  try {
    const response = await fetch(apiUrl("/api/member/data?action=fast-connection-signal"), {
      method: "POST",
      headers: await memberApiHeaders(),
      body: JSON.stringify({
        email: user.email,
        phone: user.phone,
        targetProfileId
      })
    });
    const payload = await readResponseJson<SignalResponse>(response);
    const status = syncFastSignalStatusFromServer({
      passActive: true,
      usedToday: payload?.usedToday,
      dailyLimit: payload?.dailyLimit,
      remaining: payload?.remaining,
      resetAt: payload?.resetAt
    });

    if (payload?.limitReached) {
      return {
        ok: false,
        limitReached: true,
        error: payload.error || "You've used today's Fast Signals.",
        status
      };
    }

    if (!response.ok || payload?.ok === false) {
      return {
        ok: false,
        error: payload?.error || "Could not send Fast Signal.",
        status
      };
    }

    return { ok: true, status };
  } catch {
    return {
      ok: false,
      error: "Could not send Fast Signal.",
      status: syncFastSignalStatusFromServer({ passActive: false, expired: true })
    };
  }
}

export async function fetchFastConnectionPurchaseHistory(
  user: Pick<UserProfile, "email" | "phone">
): Promise<{ ok: boolean; purchases: HistoryResponse["purchases"] }> {
  try {
    const response = await fetch(apiUrl("/api/member/data?action=fast-connection-history"), {
      method: "POST",
      headers: await memberApiHeaders(),
      body: JSON.stringify({
        email: user.email,
        phone: user.phone
      })
    });
    const payload = await readResponseJson<HistoryResponse>(response);
    if (!response.ok || !payload?.ok) {
      return { ok: false, purchases: [] };
    }
    return { ok: true, purchases: Array.isArray(payload.purchases) ? payload.purchases : [] };
  } catch {
    return { ok: false, purchases: [] };
  }
}
