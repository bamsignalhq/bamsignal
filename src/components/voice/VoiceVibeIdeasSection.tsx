import { useMemo } from "react";
import {
  VOICE_VIBE_EMPTY_HEADLINE,
  VOICE_VIBE_EMPTY_SUBTEXT,
  VOICE_VIBE_INSPIRATION_FREESTYLE_HINT,
  VOICE_VIBE_INSPIRATION_HEADLINE,
  VOICE_VIBE_INSPIRATION_SUBTEXT,
  type VoiceVibeIdea
} from "../../constants/voiceVibeIdeas";
import {
  personalizeVoiceVibeIdeaText,
  rankVoiceVibeIdeasForProfile,
  stopVoiceVibeIdeaAloud,
  type VoiceVibeIdeasProfile
} from "../../utils/voiceVibeIdeas";
import { VoiceVibeIdeaCard } from "./VoiceVibeIdeaCard";

type VoiceVibeIdeasSectionProps = {
  profile: VoiceVibeIdeasProfile;
  memberName?: string;
  scriptDraft: string;
  onScriptDraftChange: (value: string) => void;
  selectedIdeaId?: string | null;
  onSelectedIdeaIdChange?: (id: string | null) => void;
  className?: string;
};

export function VoiceVibeIdeasSection({
  profile,
  memberName,
  scriptDraft,
  onScriptDraftChange,
  selectedIdeaId,
  onSelectedIdeaIdChange,
  className = ""
}: VoiceVibeIdeasSectionProps) {
  const ideas = useMemo(() => rankVoiceVibeIdeasForProfile(profile), [profile]);

  const ideaTexts = useMemo(
    () =>
      new Map(
        ideas.map((idea) => [idea.id, personalizeVoiceVibeIdeaText(idea, { memberName, city: profile.city })] as const)
      ),
    [ideas, memberName, profile.city]
  );

  const hasDraft = Boolean(scriptDraft.trim());
  const headline = hasDraft ? VOICE_VIBE_INSPIRATION_HEADLINE : VOICE_VIBE_EMPTY_HEADLINE;
  const subtext = hasDraft ? VOICE_VIBE_INSPIRATION_SUBTEXT : VOICE_VIBE_EMPTY_SUBTEXT;

  const handleUse = (idea: VoiceVibeIdea) => {
    const text = ideaTexts.get(idea.id) ?? idea.text;
    onScriptDraftChange(text);
    onSelectedIdeaIdChange?.(idea.id);
    stopVoiceVibeIdeaAloud();
  };

  return (
    <section className={`voice-vibe-ideas ${className}`.trim()} aria-label={headline}>
      <header className="voice-vibe-ideas__head">
        <h2>{headline}</h2>
        <p>{subtext}</p>
      </header>

      <div className="voice-vibe-ideas__list">
        {ideas.map((idea, index) => (
          <VoiceVibeIdeaCard
            key={idea.id}
            idea={idea}
            text={ideaTexts.get(idea.id) ?? idea.text}
            selected={selectedIdeaId === idea.id}
            staggerIndex={index}
            onUse={() => handleUse(idea)}
          />
        ))}
      </div>

      <label className="voice-vibe-ideas__freestyle">
        <span className="voice-vibe-ideas__freestyle-label">{VOICE_VIBE_INSPIRATION_FREESTYLE_HINT}</span>
        <textarea
          value={scriptDraft}
          onChange={(event) => {
            onSelectedIdeaIdChange?.(null);
            onScriptDraftChange(event.target.value);
          }}
          placeholder="Write in your own words — nothing here is required."
          rows={4}
        />
      </label>
    </section>
  );
}
