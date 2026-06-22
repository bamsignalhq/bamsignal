import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  GREAT_ROOM_CARD_LABEL
} from "../../../constants/greatRoom";
import type { GreatRoomCardViewModel } from "../../../utils/greatRoomLogic";

type GreatRoomCardProps = {
  room: GreatRoomCardViewModel;
};

export function GreatRoomCard({ room }: GreatRoomCardProps) {
  return (
    <article className="grm-room-card institute-glass">
      <header className="grm-room-card__head">
        <h3>{room.title}</h3>
        <span className="grm-room-card__badge">{GREAT_ROOM_CARD_LABEL}</span>
      </header>
      <p className="grm-room-card__description">{room.description}</p>
      <p className="grm-room-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="grm-room-card__status">{room.statusLabel}</p>
    </article>
  );
}
