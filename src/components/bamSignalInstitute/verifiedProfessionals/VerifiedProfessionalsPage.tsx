import { useMemo } from "react";
import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_VERIFIED_BADGES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL,
  VERIFIED_PROFESSIONALS_FUTURE_CAPABILITIES,
  VERIFIED_PROFESSIONALS_LABEL,
  VERIFIED_PROFESSIONALS_PURPOSE_COPY,
  VERIFIED_PROFESSIONALS_RESERVED_COPY,
  VERIFIED_PROFESSIONALS_SUBCOPY,
  VERIFIED_PROFESSIONALS_TITLE
} from "../../../constants/verifiedProfessionals";
import { getVerifiedProfessionalsBundle } from "../../../utils/VerifiedProfessionalsEngine";
import { ExpertTimelineCard } from "./ExpertTimelineCard";
import { ProfessionalBadge } from "./ProfessionalBadge";
import { ProfessionalProfileCard } from "./ProfessionalProfileCard";

export function VerifiedProfessionalsPage() {
  const bundle = useMemo(() => getVerifiedProfessionalsBundle(), []);

  return (
    <div className="vp-page">
      <header className="vp-page__hero institute-glass">
        <p className="bi-page__eyebrow">{VERIFIED_PROFESSIONALS_LABEL}</p>
        <h1>{VERIFIED_PROFESSIONALS_TITLE}</h1>
        <p>{VERIFIED_PROFESSIONALS_SUBCOPY}</p>
        <p className="vp-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="vp-page__purpose">{VERIFIED_PROFESSIONALS_PURPOSE_COPY}</p>
      </header>

      <section className="vp-page__prepared institute-glass">
        <h2>Prepared badges</h2>
        <p>{bundle.badgeCount} badges — architecture preview, not verified yet.</p>
        <ul className="vp-page__prepared-list">
          {PREPARED_VERIFIED_BADGES.map((badge) => (
            <li key={badge.id}>
              <strong>{badge.title}</strong>
              <span>{badge.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="vp-page__section">
        <header className="bi-section-head">
          <h2>Verified profiles</h2>
          <p>Professional profiles prepared — not enabled yet.</p>
        </header>
        <div className="vp-page__grid">
          {bundle.profiles.map((profile) => (
            <ProfessionalProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      </section>

      <section className="vp-page__section">
        <header className="bi-section-head">
          <h2>Expert badges</h2>
          <p>Verification badges reserved — dignity-first framing.</p>
        </header>
        <div className="vp-page__grid">
          {bundle.badges.map((badge) => (
            <ProfessionalBadge key={badge.id} badge={badge} />
          ))}
        </div>
      </section>

      {bundle.profiles.map((profile) => (
        <ExpertTimelineCard
          key={`${profile.id}-timeline`}
          title={profile.badgeTitle}
          entries={profile.timeline}
        />
      ))}

      <section className="vp-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {VERIFIED_PROFESSIONALS_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="vp-page__reserved">{VERIFIED_PROFESSIONALS_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
