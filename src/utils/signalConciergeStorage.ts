import { STORAGE_KEYS } from "../constants/limits";
import type { SignalConciergeApplication, SignalConciergeApplicationDraft } from "../types/signalConcierge";
import { emptySignalConciergeApplication } from "../types/signalConcierge";
import { readJson, writeJson } from "./storage";

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

export function submitSignalConciergeApplication(
  draft: SignalConciergeApplicationDraft
): SignalConciergeApplication {
  const base = readSignalConciergeApplication() ?? emptySignalConciergeApplication();
  const application: SignalConciergeApplication = {
    ...base,
    ...draft,
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
  writeJson(STORAGE_KEYS.signalConciergeApplication, application);
  writeSignalConciergeDraft({ wizardStep: 0 });
  return application;
}

export function isSignalConciergeMemberActive(): boolean {
  const application = readSignalConciergeApplication();
  if (!application) return false;
  return !["closed", "paused"].includes(application.status);
}
