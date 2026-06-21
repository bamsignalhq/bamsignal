import { VOICE_VIBE_CHIP_LABEL } from "../../constants/voiceVibeUi";

type VoiceVibeChipProps = {
  className?: string;
};

export function VoiceVibeChip({ className = "" }: VoiceVibeChipProps) {
  return (
    <span className={`voice-vibe-chip ${className}`.trim()} title="Voice Vibe available">
      {VOICE_VIBE_CHIP_LABEL}
    </span>
  );
}
