import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  LEGACY_HALL_LABEL,
  LEGACY_HALL_PRESERVE_COPY,
  LEGACY_HALL_PURPOSE_COPY,
  LEGACY_HALL_RESERVED_COPY,
  LEGACY_HALL_SUBCOPY,
  LEGACY_HALL_TITLE,
  PREPARED_LEGACY_HALL_HONOURS,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/legacyHall";
import { getLegacyHallBundle } from "../../../utils/LegacyHallEngine";
import { FoundersFamilyCard } from "./FoundersFamilyCard";
import { GoldenAnniversaryCard } from "./GoldenAnniversaryCard";
import { LegacyCoupleCard } from "./LegacyCoupleCard";

export function LegacyHallPage() {
  const bundle = useMemo(() => getLegacyHallBundle(), []);

  return (
    <div className="lghal-page">
      <header className="lghal-page__hero institute-glass">
        <p className="bi-page__eyebrow">{LEGACY_HALL_LABEL}</p>
        <h1>{LEGACY_HALL_TITLE}</h1>
        <p>{LEGACY_HALL_SUBCOPY}</p>
        <p className="lghal-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="lghal-page__purpose">{LEGACY_HALL_PURPOSE_COPY}</p>
      </header>

      <section className="lghal-page__prepared institute-glass">
        <h2>Preserve</h2>
        <p>{LEGACY_HALL_PRESERVE_COPY}</p>
        <ul className="lghal-page__prepared-list">
          {PREPARED_LEGACY_HALL_HONOURS.map((honour) => (
            <li key={honour.id}>
              <strong>{honour.title}</strong>
              <span>{honour.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="lghal-page__section">
        <header className="bi-section-head">
          <h2>Legacy couples</h2>
          <p>Enduring partnerships — prepared, not inducted yet.</p>
        </header>
        <div className="lghal-page__grid">
          {bundle.legacyCouples.map((honour) => (
            <LegacyCoupleCard key={honour.id} honour={honour} />
          ))}
        </div>
      </section>

      <section className="lghal-page__section">
        <header className="bi-section-head">
          <h2>Golden anniversaries</h2>
          <p>Milestone unions — architecture preview only.</p>
        </header>
        <div className="lghal-page__grid">
          {bundle.goldenAnniversaries.map((honour) => (
            <GoldenAnniversaryCard key={honour.id} honour={honour} />
          ))}
        </div>
      </section>

      <section className="lghal-page__section">
        <header className="bi-section-head">
          <h2>Founders families</h2>
          <p>
            {bundle.foundersFamilies.length} honours — households and diaspora stories reserved.
          </p>
        </header>
        <div className="lghal-page__grid">
          {bundle.foundersFamilies.map((honour) => (
            <FoundersFamilyCard key={honour.id} honour={honour} />
          ))}
        </div>
      </section>

      <section className="lghal-page__reserved-note institute-glass">
        <p>{LEGACY_HALL_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
