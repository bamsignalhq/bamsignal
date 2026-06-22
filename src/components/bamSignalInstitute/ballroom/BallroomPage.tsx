import { useMemo } from "react";
import {
  BALLROOM_HOST_COPY,
  BALLROOM_LABEL,
  BALLROOM_PURPOSE_COPY,
  BALLROOM_RESERVED_COPY,
  BALLROOM_SUBCOPY,
  BALLROOM_TITLE,
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_BALLROOM_HOSTS,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/ballroom";
import { getBallroomBundle } from "../../../utils/BallroomEngine";
import { CelebrationCard } from "./CelebrationCard";
import { EventCard } from "./EventCard";
import { SummitCard } from "./SummitCard";

export function BallroomPage() {
  const bundle = useMemo(() => getBallroomBundle(), []);

  return (
    <div className="blrm-page">
      <header className="blrm-page__hero institute-glass">
        <p className="bi-page__eyebrow">{BALLROOM_LABEL}</p>
        <h1>{BALLROOM_TITLE}</h1>
        <p>{BALLROOM_SUBCOPY}</p>
        <p className="blrm-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="blrm-page__purpose">{BALLROOM_PURPOSE_COPY}</p>
      </header>

      <section className="blrm-page__prepared institute-glass">
        <h2>Host</h2>
        <p>{BALLROOM_HOST_COPY}</p>
        <ul className="blrm-page__prepared-list">
          {PREPARED_BALLROOM_HOSTS.map((host) => (
            <li key={host.id}>
              <strong>{host.title}</strong>
              <span>{host.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="blrm-page__section">
        <header className="bi-section-head">
          <h2>Summits</h2>
          <p>{bundle.summits.length} summit — prepared, not enabled yet.</p>
        </header>
        <div className="blrm-page__grid">
          {bundle.summits.map((summit) => (
            <SummitCard key={summit.id} summit={summit} />
          ))}
        </div>
      </section>

      <section className="blrm-page__section">
        <header className="bi-section-head">
          <h2>Events</h2>
          <p>Awards and galas — architecture preview only.</p>
        </header>
        <div className="blrm-page__grid">
          {bundle.events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      <section className="blrm-page__section">
        <header className="bi-section-head">
          <h2>Celebrations</h2>
          <p>
            {bundle.celebrations.length} celebrations — Legacy and anniversaries reserved.
          </p>
        </header>
        <div className="blrm-page__grid">
          {bundle.celebrations.map((celebration) => (
            <CelebrationCard key={celebration.id} celebration={celebration} />
          ))}
        </div>
      </section>

      <section className="blrm-page__reserved-note institute-glass">
        <p>{BALLROOM_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
