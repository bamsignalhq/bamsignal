import type { DatingProfile, DiscoverProfile } from "../types";

/** Canonical storage uses voiceIntroUrl — Voice Vibe is the member-facing name. */
export type VoiceVibeProfile = Pick<
  DatingProfile,
  | "voiceIntroUrl"
  | "voiceIntroDuration"
  | "voiceIntroUpdatedAt"
  | "voiceVibeUrl"
  | "voiceVibeDuration"
  | "voiceVibeTranscript"
  | "voiceVibeCreatedAt"
>;

export type VoiceVibeRecordingState = "idle" | "recording" | "paused" | "preview" | "saved";

/** Reserved for future products — not implemented. */
export type VoiceVibeFutureTier =
  | "transcripts"
  | "language-tags"
  | "ai-summaries"
  | "voice-sentiment"
  | "circle-matchmaking";

export type VoiceVibeFutureConfig = {
  tier?: VoiceVibeFutureTier;
  locale?: string;
  circleId?: string;
};

/** @deprecated use VOICE_VIBE_IDEAS from constants/voiceVibeIdeas */
export { VOICE_VIBE_SCRIPTS } from "../constants/voiceVibeIdeas";

export function getVoiceVibeUrl(profile?: VoiceVibeProfile | DiscoverProfile | null): string | undefined {
  if (!profile) return undefined;
  const url = profile.voiceVibeUrl || profile.voiceIntroUrl;
  return url?.trim() || undefined;
}

export function getVoiceVibeDuration(profile?: VoiceVibeProfile | DiscoverProfile | null): number | undefined {
  if (!profile) return undefined;
  const duration = profile.voiceVibeDuration ?? profile.voiceIntroDuration;
  return typeof duration === "number" && duration > 0 ? duration : undefined;
}

export function getVoiceVibeTranscript(profile?: VoiceVibeProfile | null): string | undefined {
  const transcript = profile?.voiceVibeTranscript?.trim();
  return transcript || undefined;
}

export function hasVoiceVibe(profile?: VoiceVibeProfile | DiscoverProfile | null): boolean {
  return Boolean(getVoiceVibeUrl(profile));
}

export function formatVoiceVibeTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const rem = safe % 60;
  return `${mins}:${rem.toString().padStart(2, "0")}`;
}

export function buildVoiceVibePatch(input: {
  url: string;
  durationSeconds: number;
  transcript?: string;
}): Pick<
  DatingProfile,
  "voiceIntroUrl" | "voiceIntroDuration" | "voiceIntroUpdatedAt" | "voiceVibeUrl" | "voiceVibeDuration" | "voiceVibeCreatedAt" | "voiceVibeTranscript"
> {
  const createdAt = new Date().toISOString();
  const duration = Math.round(input.durationSeconds);
  const transcript = input.transcript?.trim() || undefined;
  return {
    voiceIntroUrl: input.url,
    voiceIntroDuration: duration,
    voiceIntroUpdatedAt: createdAt,
    voiceVibeUrl: input.url,
    voiceVibeDuration: duration,
    voiceVibeCreatedAt: createdAt,
    voiceVibeTranscript: transcript
  };
}

export function clearVoiceVibePatch(): Pick<
  DatingProfile,
  "voiceIntroUrl" | "voiceIntroDuration" | "voiceIntroUpdatedAt" | "voiceVibeUrl" | "voiceVibeDuration" | "voiceVibeCreatedAt" | "voiceVibeTranscript"
> {
  return {
    voiceIntroUrl: undefined,
    voiceIntroDuration: undefined,
    voiceIntroUpdatedAt: undefined,
    voiceVibeUrl: undefined,
    voiceVibeDuration: undefined,
    voiceVibeCreatedAt: undefined,
    voiceVibeTranscript: undefined
  };
}
