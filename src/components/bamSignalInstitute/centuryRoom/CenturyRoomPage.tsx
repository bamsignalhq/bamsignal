import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_LABEL,
  CENTURY_ROOM_DISPLAYS,
  CENTURY_ROOM_LABEL,
  CENTURY_ROOM_PURPOSE_COPY,
  CENTURY_ROOM_RESERVED_COPY,
  CENTURY_ROOM_SUBCOPY,
  CENTURY_ROOM_TITLE,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/centuryRoom";
import { getCenturyRoomBundle } from "../../../utils/CenturyRoomEngine";
import { FoundingPrinciplesCard } from "./FoundingPrinciplesCard";
import { LegacyVisionCard } from "./LegacyVisionCard";

export function CenturyRoomPage() {
  const bundle = useMemo(() => getCenturyRoomBundle(), []);

  return (
    <div className="croom-page">
      <header className="croom-page__hero institute-glass">
        <p className="bi-page__eyebrow">{CENTURY_ROOM_LABEL}</p>
        <h1>{CENTURY_ROOM_TITLE}</h1>
        <p>{CENTURY_ROOM_SUBCOPY}</p>
        <p className="croom-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="croom-page__purpose">{CENTURY_ROOM_PURPOSE_COPY}</p>
      </header>

      <section className="croom-page__prepared institute-glass">
        <h2>Display</h2>
        <p>{bundle.displayCount} century displays — architecture preview, not ceremonies yet.</p>
        <ul className="croom-page__prepared-list">
          {CENTURY_ROOM_DISPLAYS.map((display) => (
            <li key={display.id}>
              <strong>{display.title}</strong>
              <span>{display.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="croom-page__section">
        <header className="bi-section-head">
          <h2>Legacy vision</h2>
          <p>100-Year Vision and Legacy — prepared, not enabled yet.</p>
        </header>
        <div className="croom-page__grid">
          {bundle.legacyVision.map((vision) => (
            <LegacyVisionCard key={vision.id} vision={vision} />
          ))}
        </div>
      </section>

      <section className="croom-page__section">
        <header className="bi-section-head">
          <h2>Founding principles</h2>
          <p>Founding Values through Community — architecture reserved, not live yet.</p>
        </header>
        <div className="croom-page__grid">
          {bundle.foundingPrinciples.map((principles) => (
            <FoundingPrinciplesCard key={principles.id} principles={principles} />
          ))}
        </div>
      </section>

      <section className="croom-page__reserved-note institute-glass">
        <p>{CENTURY_ROOM_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
