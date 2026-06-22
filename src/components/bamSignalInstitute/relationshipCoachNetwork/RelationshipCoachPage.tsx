import { useMemo } from "react";
import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_COACH_SPECIALTIES,
  RELATIONSHIP_COACH_NETWORK_LABEL,
  RELATIONSHIP_COACH_NETWORK_PURPOSE_COPY,
  RELATIONSHIP_COACH_NETWORK_RESERVED_COPY,
  RELATIONSHIP_COACH_NETWORK_SUBCOPY,
  RELATIONSHIP_COACH_NETWORK_TITLE,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/relationshipCoachNetwork";
import { getRelationshipCoachNetworkBundle } from "../../../utils/RelationshipCoachNetworkEngine";
import { CoachBadge } from "./CoachBadge";
import { CoachProfileCard } from "./CoachProfileCard";

export function RelationshipCoachPage() {
  const bundle = useMemo(() => getRelationshipCoachNetworkBundle(), []);

  return (
    <div className="rcn-page">
      <header className="rcn-page__hero institute-glass">
        <p className="bi-page__eyebrow">{RELATIONSHIP_COACH_NETWORK_LABEL}</p>
        <h1>{RELATIONSHIP_COACH_NETWORK_TITLE}</h1>
        <p>{RELATIONSHIP_COACH_NETWORK_SUBCOPY}</p>
        <p className="rcn-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="rcn-page__purpose">{RELATIONSHIP_COACH_NETWORK_PURPOSE_COPY}</p>
      </header>

      <section className="rcn-page__prepared institute-glass">
        <h2>Prepared coaches</h2>
        <p>{bundle.specialtyCount} specialties — architecture preview, not live yet.</p>
        <ul className="rcn-page__prepared-list">
          {PREPARED_COACH_SPECIALTIES.map((specialty) => (
            <li key={specialty.id}>
              <strong>{specialty.title}</strong>
              <span>{specialty.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rcn-page__section">
        <header className="bi-section-head">
          <h2>Coach profiles</h2>
          <p>Relationship coaches prepared — not enabled yet.</p>
        </header>
        <div className="rcn-page__grid">
          {bundle.profiles.map((profile) => (
            <CoachProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      </section>

      <section className="rcn-page__section">
        <header className="bi-section-head">
          <h2>Coach badges</h2>
          <p>Network specialties reserved — dignity-first framing.</p>
        </header>
        <div className="rcn-page__grid">
          {bundle.badges.map((badge) => (
            <CoachBadge key={badge.id} badge={badge} />
          ))}
        </div>
      </section>

      <section className="rcn-page__reserved-note institute-glass">
        <p>{RELATIONSHIP_COACH_NETWORK_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
