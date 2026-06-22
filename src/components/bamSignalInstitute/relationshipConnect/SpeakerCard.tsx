import { SPEAKER_LABEL } from "../../../constants/relationshipConnect";
import type { SpeakerViewModel } from "../../../utils/relationshipConnectLogic";

type SpeakerCardProps = {
  speaker: SpeakerViewModel;
};

export function SpeakerCard({ speaker }: SpeakerCardProps) {
  return (
    <article className="rconn-speaker-card institute-glass">
      <header className="rconn-speaker-card__head">
        <h3>{speaker.title}</h3>
        <span className="rconn-speaker-card__badge">{SPEAKER_LABEL}</span>
      </header>
      <p className="rconn-speaker-card__description">{speaker.description}</p>
      <p className="rconn-speaker-card__status">{speaker.statusLabel}</p>
    </article>
  );
}
