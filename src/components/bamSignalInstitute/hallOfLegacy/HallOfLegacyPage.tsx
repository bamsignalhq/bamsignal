import { useMemo } from "react";
import {
  CELEBRATING_LOVE_LABEL,
  HALL_OF_LEGACY_CONSENT_COPY,
  HALL_OF_LEGACY_FUTURE_CAPABILITIES,
  HALL_OF_LEGACY_LABEL,
  HALL_OF_LEGACY_PRIVACY_COPY,
  HALL_OF_LEGACY_PURPOSE_COPY,
  HALL_OF_LEGACY_RESERVED_COPY,
  HALL_OF_LEGACY_SUBCOPY,
  HALL_OF_LEGACY_TITLE,
  LEGACY_COUPLES_LABEL,
  PRESERVED_LEGACY_CATEGORIES,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/hallOfLegacy";
import { getHallOfLegacyBundle } from "../../../utils/HallOfLegacyEngine";
import { DiasporaStoryCard } from "./DiasporaStoryCard";
import { FoundersCoupleCard } from "./FoundersCoupleCard";
import { GoldenAnniversaryCard } from "./GoldenAnniversaryCard";
import { LegacyCoupleCard } from "./LegacyCoupleCard";

export function HallOfLegacyPage() {
  const bundle = useMemo(() => getHallOfLegacyBundle(), []);

  return (
    <div className="hol-page">
      <header className="hol-page__hero institute-glass">
        <p className="bi-page__eyebrow">{HALL_OF_LEGACY_LABEL}</p>
        <h1>{HALL_OF_LEGACY_TITLE}</h1>
        <p>{HALL_OF_LEGACY_SUBCOPY}</p>
        <p className="hol-page__labels">
          {CELEBRATING_LOVE_LABEL} · {LEGACY_COUPLES_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="hol-page__purpose">{HALL_OF_LEGACY_PURPOSE_COPY}</p>
        <p className="hol-page__privacy">{HALL_OF_LEGACY_PRIVACY_COPY}</p>
        <p className="hol-page__consent">{HALL_OF_LEGACY_CONSENT_COPY}</p>
      </header>

      <section className="hol-page__prepared institute-glass">
        <h2>Preserved journeys</h2>
        <p>
          {bundle.categoryCount} categories — private by default, consent required, never leaderboards.
        </p>
        <ul className="hol-page__prepared-list">
          {PRESERVED_LEGACY_CATEGORIES.map((category) => (
            <li key={category.id}>
              <strong>{category.label}</strong>
              <span>{category.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hol-page__section">
        <header className="bi-section-head">
          <h2>Founders couples</h2>
          <p>Honored journeys — not published without consent.</p>
        </header>
        <div className="hol-page__grid">
          {bundle.foundersCouples.map((journey) => (
            <FoundersCoupleCard key={journey.id} journey={journey} />
          ))}
        </div>
      </section>

      <section className="hol-page__section">
        <header className="bi-section-head">
          <h2>Legacy couples</h2>
          <p>{LEGACY_COUPLES_LABEL} — private by default.</p>
        </header>
        <div className="hol-page__grid">
          {bundle.legacyCouples.map((journey) => (
            <LegacyCoupleCard key={journey.id} journey={journey} />
          ))}
        </div>
      </section>

      <section className="hol-page__section">
        <header className="bi-section-head">
          <h2>Golden anniversaries</h2>
          <p>25-year marriages and beyond — {CELEBRATING_LOVE_LABEL}.</p>
        </header>
        <div className="hol-page__grid">
          {bundle.goldenAnniversaries.map((journey) => (
            <GoldenAnniversaryCard key={journey.id} journey={journey} />
          ))}
        </div>
      </section>

      <section className="hol-page__section">
        <header className="bi-section-head">
          <h2>Diaspora stories</h2>
          <p>Extraordinary corridors — consent required.</p>
        </header>
        <div className="hol-page__grid">
          {bundle.diasporaStories.map((journey) => (
            <DiasporaStoryCard key={journey.id} journey={journey} />
          ))}
        </div>
      </section>

      <section className="hol-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {HALL_OF_LEGACY_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="hol-page__reserved">{HALL_OF_LEGACY_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
