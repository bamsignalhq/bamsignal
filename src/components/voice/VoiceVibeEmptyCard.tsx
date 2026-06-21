import { Mic } from "lucide-react";
import {
  VOICE_VIBE_EMPTY_CTA,
  VOICE_VIBE_EMPTY_HEADLINE,
  VOICE_VIBE_EMPTY_SUBTEXT
} from "../../constants/voiceVibeUi";

type VoiceVibeEmptyCardProps = {
  onAdd: () => void;
  className?: string;
};

export function VoiceVibeEmptyCard({ onAdd, className = "" }: VoiceVibeEmptyCardProps) {
  return (
    <div className={`voice-vibe-empty-card ${className}`.trim()}>
      <div className="voice-vibe-empty-card__illustration" aria-hidden>
        <Mic size={28} strokeWidth={1.5} />
      </div>
      <h3>{VOICE_VIBE_EMPTY_HEADLINE}</h3>
      <p>{VOICE_VIBE_EMPTY_SUBTEXT}</p>
      <button type="button" className="btn-primary btn-sm" onClick={onAdd}>
        {VOICE_VIBE_EMPTY_CTA}
      </button>
    </div>
  );
}
