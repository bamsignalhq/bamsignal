import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_LABEL,
  FAMILY_TABLE_LABEL,
  FAMILY_TABLE_PURPOSE_COPY,
  FAMILY_TABLE_RESERVED_COPY,
  FAMILY_TABLE_SUBCOPY,
  FAMILY_TABLE_TITLE,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_FAMILY_TABLE_DINNERS,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/familyTable";
import { getFamilyTableBundle } from "../../../utils/FamilyTableEngine";
import { DinnerExperienceCard } from "./DinnerExperienceCard";
import { LegacyDinnerCard } from "./LegacyDinnerCard";

export function FamilyTablePage() {
  const bundle = useMemo(() => getFamilyTableBundle(), []);

  return (
    <div className="ftbl-page">
      <header className="ftbl-page__hero institute-glass">
        <p className="bi-page__eyebrow">{FAMILY_TABLE_LABEL}</p>
        <h1>{FAMILY_TABLE_TITLE}</h1>
        <p>{FAMILY_TABLE_SUBCOPY}</p>
        <p className="ftbl-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="ftbl-page__purpose">{FAMILY_TABLE_PURPOSE_COPY}</p>
      </header>

      <section className="ftbl-page__prepared institute-glass">
        <h2>Prepared dinners</h2>
        <p>{bundle.dinnerCount} experiences — shared meals at the House, not bookings yet.</p>
        <ul className="ftbl-page__prepared-list">
          {PREPARED_FAMILY_TABLE_DINNERS.map((dinner) => (
            <li key={dinner.id}>
              <strong>{dinner.title}</strong>
              <span>{dinner.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ftbl-page__section">
        <header className="bi-section-head">
          <h2>Dinner experiences</h2>
          <p>Family, anniversary, and celebration — prepared, not enabled yet.</p>
        </header>
        <div className="ftbl-page__grid">
          {bundle.dinnerExperiences.map((dinner) => (
            <DinnerExperienceCard key={dinner.id} dinner={dinner} />
          ))}
        </div>
      </section>

      <section className="ftbl-page__section">
        <header className="bi-section-head">
          <h2>Legacy dinners</h2>
          <p>Founders and legacy couples — architecture preview only.</p>
        </header>
        <div className="ftbl-page__grid">
          {bundle.legacyDinners.map((dinner) => (
            <LegacyDinnerCard key={dinner.id} dinner={dinner} />
          ))}
        </div>
      </section>

      <section className="ftbl-page__reserved-note institute-glass">
        <p>{FAMILY_TABLE_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
