import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  CONNECT_HOUSE_CONFERENCE_LABEL,
  RELATIONSHIP_CONNECT_FORBIDDEN_COPY
} from "../../../constants/relationshipConnectHouse";
import type { ConnectHouseConferenceCardViewModel } from "../../../utils/relationshipConnectHouseLogic";

type ConferenceCardProps = {
  conference: ConnectHouseConferenceCardViewModel;
};

export function ConferenceCard({ conference }: ConferenceCardProps) {
  return (
    <article className="rchp-conference-card institute-glass">
      <header className="rchp-conference-card__head">
        <h3>{conference.title}</h3>
        <span className="rchp-conference-card__badge">{CONNECT_HOUSE_CONFERENCE_LABEL}</span>
      </header>
      <p className="rchp-conference-card__description">{conference.description}</p>
      <p className="rchp-conference-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}. Not{" "}
        {RELATIONSHIP_CONNECT_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="rchp-conference-card__status">{conference.statusLabel}</p>
    </article>
  );
}
