import type { VoiceVibeWaveformCardVariant } from "../../constants/voiceVibeUi";
import { VoiceVibeWaveformCard } from "./VoiceVibeWaveformCard";

/** @deprecated use VoiceVibeWaveformCardVariant */
export type VoiceVibePlayerVariant = "hero" | "card" | "compact" | "discover";

type VoiceVibePlayerProps = {
  url: string;
  duration?: number;
  variant?: VoiceVibePlayerVariant;
  title?: string;
  className?: string;
  onPlayStateChange?: (playing: boolean) => void;
};

function mapVariant(variant: VoiceVibePlayerVariant): VoiceVibeWaveformCardVariant {
  if (variant === "discover") return "mini";
  if (variant === "compact") return "chip";
  return variant;
}

export function VoiceVibePlayer({
  url,
  duration,
  variant = "card",
  title = "Voice Vibe",
  className = "",
  onPlayStateChange
}: VoiceVibePlayerProps) {
  return (
    <VoiceVibeWaveformCard
      url={url}
      duration={duration}
      variant={mapVariant(variant)}
      title={title}
      className={className}
      onPlayStateChange={onPlayStateChange}
    />
  );
}

export { VoiceVibeWaveformCard } from "./VoiceVibeWaveformCard";
