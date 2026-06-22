import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  CONVERSATION_AREA_LABEL
} from "../../../constants/greatRoom";
import type { ConversationAreaCardViewModel } from "../../../utils/greatRoomLogic";

type ConversationAreaCardProps = {
  area: ConversationAreaCardViewModel;
};

export function ConversationAreaCard({ area }: ConversationAreaCardProps) {
  return (
    <article className="grm-area-card institute-glass">
      <header className="grm-area-card__head">
        <h3>{area.title}</h3>
        <span className="grm-area-card__badge">{CONVERSATION_AREA_LABEL}</span>
      </header>
      <p className="grm-area-card__purpose">{area.purposeTitle}</p>
      <p className="grm-area-card__description">{area.description}</p>
      <p className="grm-area-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="grm-area-card__status">{area.statusLabel}</p>
    </article>
  );
}
