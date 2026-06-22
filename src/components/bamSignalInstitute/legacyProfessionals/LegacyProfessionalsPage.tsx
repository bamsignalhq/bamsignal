import { useMemo } from "react";
import {
  FUTURE_READY_LEGACY_PROFESSIONAL_CAPABILITIES,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  LEGACY_PROFESSIONALS_FORBIDDEN_COPY,
  LEGACY_PROFESSIONALS_FUTURE_READY_COPY,
  LEGACY_PROFESSIONALS_GOOD_COPY,
  LEGACY_PROFESSIONALS_LABEL,
  LEGACY_PROFESSIONALS_PURPOSE_COPY,
  LEGACY_PROFESSIONALS_RESERVED_COPY,
  LEGACY_PROFESSIONALS_SUBCOPY,
  LEGACY_PROFESSIONALS_TITLE,
  PREPARED_LEGACY_ROLES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/legacyProfessionals";
import { getLegacyProfessionalsBundle } from "../../../utils/LegacyProfessionalsEngine";
import { LegacyProfessionalCard } from "./LegacyProfessionalCard";
import { LegacyRoleCard } from "./LegacyRoleCard";
import { ProfessionalJourneyCard } from "./ProfessionalJourneyCard";

export function LegacyProfessionalsPage() {
  const bundle = useMemo(() => getLegacyProfessionalsBundle(), []);

  return (
    <div className="lgpr-page">
      <header className="lgpr-page__hero institute-glass">
        <p className="bi-page__eyebrow">{LEGACY_PROFESSIONALS_LABEL}</p>
        <h1>{LEGACY_PROFESSIONALS_TITLE}</h1>
        <p>{LEGACY_PROFESSIONALS_SUBCOPY}</p>
        <p className="lgpr-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="lgpr-page__purpose">{LEGACY_PROFESSIONALS_PURPOSE_COPY}</p>
      </header>

      <section className="lgpr-page__copy-rules institute-glass">
        <h2>Copy guidance</h2>
        <p>
          Use: {LEGACY_PROFESSIONALS_GOOD_COPY.join(", ")}. Avoid:{" "}
          {LEGACY_PROFESSIONALS_FORBIDDEN_COPY.join(", ")}.
        </p>
      </section>

      <section className="lgpr-page__prepared institute-glass">
        <h2>Prepared roles</h2>
        <p>{bundle.roleCount} roles — multi-decade experts, not senior employees.</p>
        <ul className="lgpr-page__prepared-list">
          {PREPARED_LEGACY_ROLES.map((role) => (
            <li key={role.id}>
              <strong>{role.title}</strong>
              <span>{role.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="lgpr-page__section">
        <header className="bi-section-head">
          <h2>Legacy roles</h2>
          <p>Trusted Advisor standing — prepared, not enabled yet.</p>
        </header>
        <div className="lgpr-page__grid">
          {bundle.roles.map((role) => (
            <LegacyRoleCard key={role.id} role={role} />
          ))}
        </div>
      </section>

      <section className="lgpr-page__section">
        <header className="bi-section-head">
          <h2>Legacy professionals</h2>
          <p>Legacy Professional profiles — reserved, not veterans or employees.</p>
        </header>
        <div className="lgpr-page__grid">
          {bundle.professionals.map((professional) => (
            <LegacyProfessionalCard key={professional.id} professional={professional} />
          ))}
        </div>
      </section>

      <section className="lgpr-page__section">
        <header className="bi-section-head">
          <h2>Professional journeys</h2>
          <p>Multi-decade journeys — Lifetime Steward honour, not implementation yet.</p>
        </header>
        <div className="lgpr-page__grid">
          {bundle.journeys.map((journey) => (
            <ProfessionalJourneyCard key={journey.id} journey={journey} />
          ))}
        </div>
      </section>

      <section className="lgpr-page__future-ready institute-glass">
        <h2>Future-ready capabilities</h2>
        <p>{LEGACY_PROFESSIONALS_FUTURE_READY_COPY}</p>
        <ul className="lgpr-page__prepared-list">
          {FUTURE_READY_LEGACY_PROFESSIONAL_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.title}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="lgpr-page__reserved-note institute-glass">
        <p>{LEGACY_PROFESSIONALS_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
