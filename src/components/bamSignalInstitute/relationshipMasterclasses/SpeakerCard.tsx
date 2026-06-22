import {
  GROWING_TOGETHER_LABEL,
  RELATIONSHIP_MASTERCLASSES_LABEL
} from "../../../constants/relationshipMasterclasses";
import type { SpeakerViewModel } from "../../../utils/relationshipMasterclassesLogic";

type SpeakerCardProps = {
  speaker: SpeakerViewModel;
};

export function SpeakerCard({ speaker }: SpeakerCardProps) {
  return (
    <article className="rmc-speaker-card institute-glass">
      <header className="rmc-speaker-card__head">
        <h3>{speaker.name}</h3>
        <span className="rmc-speaker-card__badge">{RELATIONSHIP_MASTERCLASSES_LABEL}</span>
      </header>

      <p className="rmc-speaker-card__labels">{GROWING_TOGETHER_LABEL}</p>
      <p className="rmc-speaker-card__title">{speaker.title}</p>
      <p className="rmc-speaker-card__masterclass">{speaker.masterclassTitle}</p>
      <p className="rmc-speaker-card__focus">{speaker.focus}</p>
      <p className="rmc-speaker-card__status">{speaker.statusLabel}</p>
    </article>
  );
}
