import { STORAGE_KEYS } from "../constants/limits";
import type { SignalConciergeApplication, SignalConciergeApplicationDraft } from "../types/signalConcierge";
import { emptySignalConciergeApplication } from "../types/signalConcierge";
import { ensureMemberJourneyId } from "./conciergeJourneyRegistry";
import { readJson, writeJson } from "./storage";
import { apiUrl } from "../services/supabase";
import { readResponseJson } from "./httpJson";

/**
 * Drafts stay in local storage (temporary UI state).
 * Submitted applications are cached locally and synced to PostgreSQL when the member is authenticated.
 */
export function readSignalConciergeApplication(): SignalConciergeApplication | null {
  return readJson<SignalConciergeApplication | null>(STORAGE_KEYS.signalConciergeApplication, null);
}

export function readSignalConciergeDraft(): SignalConciergeApplicationDraft {
  return readJson<SignalConciergeApplicationDraft>(STORAGE_KEYS.signalConciergeDraft, {});
}

export function writeSignalConciergeDraft(draft: SignalConciergeApplicationDraft): void {
  writeJson(STORAGE_KEYS.signalConciergeDraft, draft);
}

export function mergeSignalConciergeDraft(
  patch: SignalConciergeApplicationDraft
): SignalConciergeApplicationDraft {
  const next = { ...readSignalConciergeDraft(), ...patch, updatedAt: new Date().toISOString() };
  writeSignalConciergeDraft(next);
  return next;
}

function cacheApplication(application: SignalConciergeApplication): void {
  writeJson(STORAGE_KEYS.signalConciergeApplication, application);
}

export function submitSignalConciergeApplication(
  draft: SignalConciergeApplicationDraft
): SignalConciergeApplication {
  const base = readSignalConciergeApplication() ?? emptySignalConciergeApplication();
  const journeyId =
    base.journeyId ??
    ensureMemberJourneyId(base.id, base.createdAt, draft.journeyId);
  const application: SignalConciergeApplication = {
    ...base,
    ...draft,
    journeyId,
    aboutYou: { ...base.aboutYou, ...draft.aboutYou },
    relationshipGoals: { ...base.relationshipGoals, ...draft.relationshipGoals },
    valuesLifestyle: { ...base.valuesLifestyle, ...draft.valuesLifestyle },
    story: { ...base.story, ...draft.story },
    voiceVibe: { ...base.voiceVibe, ...draft.voiceVibe },
    videoIntro: { ...base.videoIntro, ...draft.videoIntro },
    identity: { ...base.identity, ...draft.identity },
    consultationPreferences: {
      preferredDays: "",
      preferredTimeRange: "",
      additionalNotes: "",
      ...base.consultationPreferences,
      ...draft.consultationPreferences,
      preferredChannel:
        draft.consultationPreferences?.preferredChannel ??
        draft.consultationPreference ??
        base.consultationPreferences?.preferredChannel ??
        base.consultationPreference
    },
    consultationPreference:
      draft.consultationPreferences?.preferredChannel ??
      draft.consultationPreference ??
      base.consultationPreference,
    status: draft.status ?? base.status ?? "applied",
    updatedAt: new Date().toISOString()
  };
  cacheApplication(application);
  writeSignalConciergeDraft({ wizardStep: 0 });
  void persistSignalConciergeApplicationToServer(application);
  return application;
}

/** Push submitted application to PostgreSQL (authoritative). Local cache remains for offline UI. */
export async function persistSignalConciergeApplicationToServer(
  application: SignalConciergeApplication
): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch(apiUrl("/api/concierge-persistence?action=member-upsert"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ member: application })
    });
    const payload = (await readResponseJson<{ ok?: boolean; error?: string }>(response)) ?? {};
    if (!payload.ok) {
      return { ok: false, error: payload.error };
    }

    // Ops engine: create/ensure case at applied (workflow layer — does not grant membership).
    const { submitConciergeApplicationToOps } = await import("./conciergeMemberApi");
    const ops = await submitConciergeApplicationToOps({
      journeyId: application.journeyId,
      preferredTier: application.preferredTier || null,
      application: application as unknown as Record<string, unknown>
    });
    if (!ops.ok) {
      return { ok: false, error: ops.error || "ops_submit_failed" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "network_error" };
  }
}

/** Prefer PostgreSQL when available; fall back to local cache. */
export async function hydrateSignalConciergeApplicationFromServer(): Promise<SignalConciergeApplication | null> {
  try {
    const response = await fetch(apiUrl("/api/concierge-persistence?action=member-get"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({})
    });
    const payload =
      (await readResponseJson<{ ok?: boolean; member?: SignalConciergeApplication | null }>(response)) ??
      {};
    if (payload.ok && payload.member && typeof payload.member === "object") {
      const merged = {
        ...emptySignalConciergeApplication(),
        ...payload.member
      } as SignalConciergeApplication;
      cacheApplication(merged);
      return merged;
    }
  } catch {
    /* keep local */
  }
  return readSignalConciergeApplication();
}

export function isSignalConciergeMemberActive(): boolean {
  const application = readSignalConciergeApplication();
  if (!application) return false;
  return !["closed", "paused"].includes(application.status);
}
