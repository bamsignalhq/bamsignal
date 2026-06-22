import { useMemo } from "react";
import {
  FUTURE_READY_TRUST_CAPABILITIES,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_TRUST_SCORE_LEVELS,
  RELATIONSHIP_WISDOM_LABEL,
  TRUST_SCORE_FORBIDDEN_COPY,
  TRUST_SCORE_FUTURE_READY_COPY,
  TRUST_SCORE_GOOD_COPY,
  TRUST_SCORE_LABEL,
  TRUST_SCORE_NO_FIVE_STAR_COPY,
  TRUST_SCORE_NO_LEADERBOARD_COPY,
  TRUST_SCORE_NO_POPULARITY_COPY,
  TRUST_SCORE_NO_STARS_COPY,
  TRUST_SCORE_PURPOSE_COPY,
  TRUST_SCORE_RESERVED_COPY,
  TRUST_SCORE_SUBCOPY,
  TRUST_SCORE_TITLE,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/trustScoreInstitute";
import { TRUST_SCORE_DISPLAY_LABELS } from "../../../utils/trustScoreInstituteLogic";
import { getTrustScoreBundle } from "../../../utils/TrustScoreInstituteEngine";
import { LegacyTrustCard } from "./LegacyTrustCard";
import { ProfessionalTrustBadge } from "./ProfessionalTrustBadge";
import { TrustMilestoneCard } from "./TrustMilestoneCard";
import { TrustScoreCard } from "./TrustScoreCard";
import { TrustTimelineCard } from "./TrustTimelineCard";

export function TrustScorePage() {
  const bundle = useMemo(() => getTrustScoreBundle(), []);

  return (
    <div className="tscr-page">
      <header className="tscr-page__hero institute-glass">
        <p className="bi-page__eyebrow">{TRUST_SCORE_LABEL}</p>
        <h1>{TRUST_SCORE_TITLE}</h1>
        <p>{TRUST_SCORE_SUBCOPY}</p>
        <p className="tscr-page__labels">
          {TRUST_SCORE_NO_STARS_COPY} · {TRUST_SCORE_NO_FIVE_STAR_COPY} · {TRUST_SCORE_NO_LEADERBOARD_COPY} ·{" "}
          {TRUST_SCORE_NO_POPULARITY_COPY} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="tscr-page__purpose">{TRUST_SCORE_PURPOSE_COPY}</p>
      </header>

      <section className="tscr-page__display institute-glass">
        <h2>Display fields</h2>
        <ul className="tscr-page__display-list">
          {Object.values(TRUST_SCORE_DISPLAY_LABELS).map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
        <p className="tscr-page__copy-rules">
          Use: {TRUST_SCORE_GOOD_COPY.join(", ")}. Avoid: {TRUST_SCORE_FORBIDDEN_COPY.join(", ")}.
        </p>
      </section>

      <section className="tscr-page__prepared institute-glass">
        <h2>Prepared levels</h2>
        <p>{bundle.levelCount} levels — long-term reputation, not ratings or rankings.</p>
        <ul className="tscr-page__prepared-list">
          {PREPARED_TRUST_SCORE_LEVELS.map((level) => (
            <li key={level.id}>
              <strong>{level.title}</strong>
              <span>{level.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="tscr-page__section">
        <header className="bi-section-head">
          <h2>Trust levels</h2>
          <p>Trusted, Premier, Legacy Trusted — levels only, not enabled yet.</p>
        </header>
        <div className="tscr-page__grid">
          {bundle.levels.map((level) => (
            <TrustScoreCard key={level.id} level={level} />
          ))}
        </div>
      </section>

      <section className="tscr-page__section">
        <header className="bi-section-head">
          <h2>Professional trust badges</h2>
          <p>Years Active and Professional Contributions — reserved, not referrals yet.</p>
        </header>
        <div className="tscr-page__grid">
          {bundle.badges.map((badge) => (
            <ProfessionalTrustBadge key={badge.id} badge={badge} />
          ))}
        </div>
      </section>

      <section className="tscr-page__section">
        <header className="bi-section-head">
          <h2>Trust Journey timelines</h2>
          <p>Trust Journey over time — not a competitive ranking.</p>
        </header>
        <div className="tscr-page__grid">
          {bundle.timelines.map((timeline) => (
            <TrustTimelineCard key={timeline.levelId} timeline={timeline} />
          ))}
        </div>
      </section>

      <section className="tscr-page__section">
        <header className="bi-section-head">
          <h2>Milestones</h2>
          <p>Earned milestones — not ratings or popularity.</p>
        </header>
        <div className="tscr-page__grid">
          {bundle.milestones.map((milestone) => (
            <TrustMilestoneCard key={milestone.id} milestone={milestone} />
          ))}
        </div>
      </section>

      <section className="tscr-page__section">
        <header className="bi-section-head">
          <h2>Legacy status</h2>
          <p>Legacy Trusted standing — dignity over competition.</p>
        </header>
        <div className="tscr-page__grid">
          {bundle.legacyProfiles.map((profile) => (
            <LegacyTrustCard key={profile.id} profile={profile} />
          ))}
        </div>
      </section>

      <section className="tscr-page__future-ready institute-glass">
        <h2>Future-ready capabilities</h2>
        <p>{TRUST_SCORE_FUTURE_READY_COPY}</p>
        <ul className="tscr-page__prepared-list">
          {FUTURE_READY_TRUST_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.title}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="tscr-page__reserved-note institute-glass">
        <p>{TRUST_SCORE_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
