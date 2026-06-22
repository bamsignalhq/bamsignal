import { BAMSIGNAL_SUMMIT_FORBIDDEN_COPY, SUMMIT_SPEAKER_LABEL } from "../../../constants/bamSignalSummit";
import type { SummitSpeakerViewModel } from "../../../utils/bamSignalSummitLogic";

type SummitSpeakerCardProps = {
  speaker: SummitSpeakerViewModel;
};

export function SummitSpeakerCard({ speaker }: SummitSpeakerCardProps) {
  return (
    <article className="bsmt-speaker-card institute-glass">
      <header className="bsmt-speaker-card__head">
        <h3>{speaker.title}</h3>
        <span className="bsmt-speaker-card__badge">{SUMMIT_SPEAKER_LABEL}</span>
      </header>
      <p className="bsmt-speaker-card__description">{speaker.description}</p>
      <p className="bsmt-speaker-card__forbidden">
        Not {BAMSIGNAL_SUMMIT_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="bsmt-speaker-card__status">{speaker.statusLabel}</p>
    </article>
  );
}
