import { getVoiceVibeDuration, getVoiceVibeUrl, hasVoiceVibe } from "../../utils/voiceVibe";
import type { DatingProfile, DiscoverProfile } from "../../types";
import { VoiceVibeWaveformCard } from "./VoiceVibeWaveformCard";

type VoiceVibeHeroProps = {
  profile: Pick<DatingProfile, "voiceIntroUrl" | "voiceIntroDuration" | "voiceVibeUrl" | "voiceVibeDuration"> | DiscoverProfile;
  editable?: boolean;
  onAdd?: () => void;
  className?: string;
};

export function VoiceVibeHero({ profile, editable = false, onAdd, className = "" }: VoiceVibeHeroProps) {
  const url = getVoiceVibeUrl(profile);
  const duration = getVoiceVibeDuration(profile);

  if (!hasVoiceVibe(profile)) {
    if (!editable) return null;
    return (
      <div className={`voice-vibe-hero voice-vibe-hero__empty ${className}`.trim()}>
        <button type="button" className="voice-vibe-hero__add" onClick={onAdd}>
          Add Voice Vibe
        </button>
      </div>
    );
  }

  if (!url) return null;

  return (
    <div className={`voice-vibe-hero ${className}`.trim()}>
      <VoiceVibeWaveformCard url={url} duration={duration} variant="hero" />
    </div>
  );
}
