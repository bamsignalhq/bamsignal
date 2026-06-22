import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_CONNECT_HOUSE_ACTIVITIES,
  PREPARED_CONNECT_HOUSE_PROGRAMS,
  RELATIONSHIP_CONNECT_FORBIDDEN_COPY,
  RELATIONSHIP_CONNECT_HOUSE_LABEL,
  RELATIONSHIP_CONNECT_HOUSE_PURPOSE_COPY,
  RELATIONSHIP_CONNECT_HOUSE_RESERVED_COPY,
  RELATIONSHIP_CONNECT_HOUSE_SUBCOPY,
  RELATIONSHIP_CONNECT_HOUSE_TITLE,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/relationshipConnectHouse";
import { getRelationshipConnectHouseBundle } from "../../../utils/RelationshipConnectHouseEngine";
import { ConferenceCard } from "./ConferenceCard";
import { NetworkingCard } from "./NetworkingCard";
import { WorkshopCard } from "./WorkshopCard";

export function RelationshipConnectHousePage() {
  const bundle = useMemo(() => getRelationshipConnectHouseBundle(), []);

  return (
    <div className="rchp-page">
      <header className="rchp-page__hero institute-glass">
        <p className="bi-page__eyebrow">{RELATIONSHIP_CONNECT_HOUSE_LABEL}</p>
        <h1>{RELATIONSHIP_CONNECT_HOUSE_TITLE}</h1>
        <p>{RELATIONSHIP_CONNECT_HOUSE_SUBCOPY}</p>
        <p className="rchp-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="rchp-page__forbidden">
          Avoid: {RELATIONSHIP_CONNECT_FORBIDDEN_COPY.join(", ")}.
        </p>
        <p className="rchp-page__purpose">{RELATIONSHIP_CONNECT_HOUSE_PURPOSE_COPY}</p>
      </header>

      <section className="rchp-page__prepared institute-glass">
        <h2>Programs</h2>
        <p>{bundle.programCount} programs — Connect at the House, not ticketing yet.</p>
        <ul className="rchp-page__prepared-list">
          {PREPARED_CONNECT_HOUSE_PROGRAMS.map((program) => (
            <li key={program.id}>
              <strong>{program.title}</strong>
              <span>{program.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rchp-page__prepared institute-glass">
        <h2>Activities</h2>
        <p>{bundle.activityCount} activities — architecture preview only.</p>
        <ul className="rchp-page__prepared-list">
          {PREPARED_CONNECT_HOUSE_ACTIVITIES.map((activity) => (
            <li key={activity.id}>
              <strong>{activity.title}</strong>
              <span>{activity.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rchp-page__section">
        <header className="bi-section-head">
          <h2>Conferences</h2>
          <p>Summits and entertainment — prepared, not enabled yet.</p>
        </header>
        <div className="rchp-page__grid">
          {bundle.conferences.map((conference) => (
            <ConferenceCard key={conference.id} conference={conference} />
          ))}
        </div>
      </section>

      <section className="rchp-page__section">
        <header className="bi-section-head">
          <h2>Workshops</h2>
          <p>Programs and lessons — architecture preview only.</p>
        </header>
        <div className="rchp-page__grid">
          {bundle.workshops.map((workshop) => (
            <WorkshopCard key={workshop.id} workshop={workshop} />
          ))}
        </div>
      </section>

      <section className="rchp-page__section">
        <header className="bi-section-head">
          <h2>Networking</h2>
          <p>Connect programs and meet & greet — reserved, not open yet.</p>
        </header>
        <div className="rchp-page__grid">
          {bundle.networking.map((networking) => (
            <NetworkingCard key={networking.id} networking={networking} />
          ))}
        </div>
      </section>

      <section className="rchp-page__reserved-note institute-glass">
        <p>{RELATIONSHIP_CONNECT_HOUSE_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
