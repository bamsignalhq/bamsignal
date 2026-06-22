import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  GREAT_ROOM_LABEL,
  GREAT_ROOM_PURPOSE_COPY,
  GREAT_ROOM_RESERVED_COPY,
  GREAT_ROOM_STYLE_TRAITS,
  GREAT_ROOM_SUBCOPY,
  GREAT_ROOM_TITLE,
  LEARNING_LABEL,
  PREPARED_CONVERSATION_AREAS,
  PREPARED_GREAT_ROOM_PURPOSES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/greatRoom";
import { getGreatRoomBundle } from "../../../utils/GreatRoomEngine";
import { ConversationAreaCard } from "./ConversationAreaCard";
import { GreatRoomCard } from "./GreatRoomCard";

export function GreatRoomPage() {
  const bundle = useMemo(() => getGreatRoomBundle(), []);

  return (
    <div className="grm-page">
      <header className="grm-page__hero institute-glass">
        <p className="bi-page__eyebrow">{GREAT_ROOM_LABEL}</p>
        <h1>{GREAT_ROOM_TITLE}</h1>
        <p>{GREAT_ROOM_SUBCOPY}</p>
        <p className="grm-page__style">{GREAT_ROOM_STYLE_TRAITS.join(" · ")}</p>
        <p className="grm-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="grm-page__purpose">{GREAT_ROOM_PURPOSE_COPY}</p>
      </header>

      <section className="grm-page__prepared institute-glass">
        <h2>Purpose</h2>
        <p>{bundle.purposeCount} pillars — Warm, Elegant, Timeless conversation architecture.</p>
        <ul className="grm-page__prepared-list">
          {PREPARED_GREAT_ROOM_PURPOSES.map((purpose) => (
            <li key={purpose.id}>
              <strong>{purpose.title}</strong>
              <span>{purpose.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grm-page__section">
        <header className="bi-section-head">
          <h2>Great Room</h2>
          <p>Purpose pillars — prepared, not open yet.</p>
        </header>
        <div className="grm-page__grid">
          {bundle.greatRooms.map((room) => (
            <GreatRoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>

      <section className="grm-page__section">
        <header className="bi-section-head">
          <h2>Conversation areas</h2>
          <p>
            {bundle.conversationAreaCount} areas — architecture preview for House Gatherings.
          </p>
        </header>
        <div className="grm-page__grid">
          {bundle.conversationAreas.map((area) => (
            <ConversationAreaCard key={area.id} area={area} />
          ))}
        </div>
      </section>

      <section className="grm-page__prepared institute-glass">
        <h2>Prepared conversation areas</h2>
        <ul className="grm-page__prepared-list">
          {PREPARED_CONVERSATION_AREAS.map((area) => (
            <li key={area.id}>
              <strong>{area.title}</strong>
              <span>{area.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grm-page__reserved-note institute-glass">
        <p>{GREAT_ROOM_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
