import { useMemo } from "react";
import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_TRUST_SCORE_LEVELS,
  RELATIONSHIP_WISDOM_LABEL,
  TRUST_SCORE_LABEL,
  TRUST_SCORE_NO_FIVE_STAR_COPY,
  TRUST_SCORE_NO_LEADERBOARD_COPY,
  TRUST_SCORE_NO_STARS_COPY,
  TRUST_SCORE_PURPOSE_COPY,
  TRUST_SCORE_RESERVED_COPY,
  TRUST_SCORE_SUBCOPY,
  TRUST_SCORE_TITLE,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/trustScoreInstitute";
import { getTrustScoreBundle } from "../../../utils/TrustScoreInstituteEngine";
import { ProfessionalTrustBadge } from "./ProfessionalTrustBadge";
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
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="tscr-page__purpose">{TRUST_SCORE_PURPOSE_COPY}</p>
      </header>

      <section className="tscr-page__prepared institute-glass">
        <h2>Prepared levels</h2>
        <p>{bundle.levelCount} levels — earned standing, not ratings or rankings.</p>
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
          <p>No stars, no 5-star ratings — levels only, not enabled yet.</p>
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
          <p>No leaderboard — reserved badges, dignity over competition.</p>
        </header>
        <div className="tscr-page__grid">
          {bundle.badges.map((badge) => (
            <ProfessionalTrustBadge key={badge.id} badge={badge} />
          ))}
        </div>
      </section>

      <section className="tscr-page__section">
        <header className="bi-section-head">
          <h2>Trust timelines</h2>
          <p>Earned journey over time — not a competitive ranking.</p>
        </header>
        <div className="tscr-page__grid">
          {bundle.timelines.map((timeline) => (
            <TrustTimelineCard key={timeline.levelId} timeline={timeline} />
          ))}
        </div>
      </section>

      <section className="tscr-page__reserved-note institute-glass">
        <p>{TRUST_SCORE_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
