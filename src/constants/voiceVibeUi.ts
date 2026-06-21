export const VOICE_VIBE_TITLE = "Voice Vibe";
export const VOICE_VIBE_SUBTEXT = "Hear their vibe";
export const VOICE_VIBE_EMPTY_HEADLINE = "No Voice Vibe yet";
export const VOICE_VIBE_EMPTY_SUBTEXT =
  "A short voice message helps people understand your personality.";
export const VOICE_VIBE_EMPTY_CTA = "Add Voice Vibe";
export const VOICE_VIBE_CHIP_LABEL = "🎙 Voice Vibe";

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

export type VoiceVibeWaveformCardVariant = "hero" | "card" | "mini" | "chip";
