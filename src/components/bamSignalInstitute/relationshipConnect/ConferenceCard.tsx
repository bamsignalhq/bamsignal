import { CONFERENCE_LABEL, RELATIONSHIP_CONNECT_FORBIDDEN_COPY } from "../../../constants/relationshipConnect";
import type { ConferenceViewModel } from "../../../utils/relationshipConnectLogic";

type ConferenceCardProps = {
  conference: ConferenceViewModel;
};

export function ConferenceCard({ conference }: ConferenceCardProps) {
  return (
    <article className="rconn-conference-card institute-glass">
      <header className="rconn-conference-card__head">
        <h3>{conference.title}</h3>
        <span className="rconn-conference-card__badge">{CONFERENCE_LABEL}</span>
      </header>
      <p className="rconn-conference-card__labels">
        Gathering — not {RELATIONSHIP_CONNECT_FORBIDDEN_COPY.join(" or ")}.
      </p>
      <p className="rconn-conference-card__description">{conference.description}</p>
      <p className="rconn-conference-card__status">{conference.statusLabel}</p>
    </article>
  );
}
