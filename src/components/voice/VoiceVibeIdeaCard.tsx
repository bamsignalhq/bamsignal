import { Volume2 } from "lucide-react";
import {
  VOICE_VIBE_IDEA_CATEGORIES,
  VOICE_VIBE_INSPIRATION_READ_LABEL,
  VOICE_VIBE_INSPIRATION_USE_LABEL,
  type VoiceVibeIdea
} from "../../constants/voiceVibeIdeas";
import { readVoiceVibeIdeaAloud } from "../../utils/voiceVibeIdeas";

type VoiceVibeIdeaCardProps = {
  idea: VoiceVibeIdea;
  text: string;
  selected?: boolean;
  staggerIndex?: number;
  onUse: () => void;
};

export function VoiceVibeIdeaCard({
  idea,
  text,
  selected = false,
  staggerIndex = 0,
  onUse
}: VoiceVibeIdeaCardProps) {
  return (
    <article
      className={`voice-vibe-idea-card${selected ? " voice-vibe-idea-card--selected" : ""}`}
      style={{ animationDelay: `${staggerIndex * 60}ms` }}
    >
      <p className="voice-vibe-idea-card__category">{VOICE_VIBE_IDEA_CATEGORIES[idea.category]}</p>
      <p className="voice-vibe-idea-card__text">{text}</p>
      <div className="voice-vibe-idea-card__actions">
        <button type="button" className="btn-primary btn-sm voice-vibe-idea-card__use" onClick={onUse}>
          {VOICE_VIBE_INSPIRATION_USE_LABEL}
        </button>
        <button
          type="button"
          className="btn-secondary btn-sm voice-vibe-idea-card__read"
          onClick={() => readVoiceVibeIdeaAloud(text)}
          aria-label={VOICE_VIBE_INSPIRATION_READ_LABEL}
        >
          <Volume2 size={15} aria-hidden />
          {VOICE_VIBE_INSPIRATION_READ_LABEL}
        </button>
      </div>
    </article>
  );
}
