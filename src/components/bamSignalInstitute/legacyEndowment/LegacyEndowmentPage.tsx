import { useMemo } from "react";
import {
  FUTURE_READY_ENDOWMENT_CAPABILITIES,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  LEGACY_ENDOWMENT_FORBIDDEN_COPY,
  LEGACY_ENDOWMENT_FUTURE_READY_COPY,
  LEGACY_ENDOWMENT_GOOD_COPY,
  LEGACY_ENDOWMENT_LABEL,
  LEGACY_ENDOWMENT_PURPOSE_COPY,
  LEGACY_ENDOWMENT_RESERVED_COPY,
  LEGACY_ENDOWMENT_SUBCOPY,
  LEGACY_ENDOWMENT_TITLE,
  PREPARED_ENDOWMENT_PROGRAMS,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/legacyEndowment";
import { getLegacyEndowmentBundle } from "../../../utils/LegacyEndowmentEngine";
import { CommunityImpactCard } from "./CommunityImpactCard";
import { EndowmentProgramCard } from "./EndowmentProgramCard";
import { ImpactFundCard } from "./ImpactFundCard";

export function LegacyEndowmentPage() {
  const bundle = useMemo(() => getLegacyEndowmentBundle(), []);

  return (
    <div className="lgnd-page">
      <header className="lgnd-page__hero institute-glass">
        <p className="bi-page__eyebrow">{LEGACY_ENDOWMENT_LABEL}</p>
        <h1>{LEGACY_ENDOWMENT_TITLE}</h1>
        <p>{LEGACY_ENDOWMENT_SUBCOPY}</p>
        <p className="lgnd-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="lgnd-page__purpose">{LEGACY_ENDOWMENT_PURPOSE_COPY}</p>
      </header>

      <section className="lgnd-page__copy-rules institute-glass">
        <h2>Copy guidance</h2>
        <p>
          Use: {LEGACY_ENDOWMENT_GOOD_COPY.join(", ")}. Avoid:{" "}
          {LEGACY_ENDOWMENT_FORBIDDEN_COPY.join(", ")}.
        </p>
      </section>

      <section className="lgnd-page__prepared institute-glass">
        <h2>Prepared programs</h2>
        <p>
          {bundle.programCount} programs — long-term impact, not{" "}
          {LEGACY_ENDOWMENT_FORBIDDEN_COPY[2].toLowerCase()}.
        </p>
        <ul className="lgnd-page__prepared-list">
          {PREPARED_ENDOWMENT_PROGRAMS.map((program) => (
            <li key={program.id}>
              <strong>{program.title}</strong>
              <span>{program.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="lgnd-page__section">
        <header className="bi-section-head">
          <h2>Endowment programs</h2>
          <p>Long-term impact structures — prepared, not enabled yet.</p>
        </header>
        <div className="lgnd-page__grid">
          {bundle.programs.map((program) => (
            <EndowmentProgramCard key={program.id} program={program} />
          ))}
        </div>
      </section>

      <section className="lgnd-page__section">
        <header className="bi-section-head">
          <h2>Impact funds</h2>
          <p>{bundle.fundCount} funds — Giving Back with dignity, not fundraising.</p>
        </header>
        <div className="lgnd-page__grid">
          {bundle.funds.map((fund) => (
            <ImpactFundCard key={fund.id} fund={fund} />
          ))}
        </div>
      </section>

      <section className="lgnd-page__section">
        <header className="bi-section-head">
          <h2>Community impact</h2>
          <p>{bundle.communityImpactCount} projects — Strengthening Families, not CSR campaigns.</p>
        </header>
        <div className="lgnd-page__grid">
          {bundle.communityImpacts.map((impact) => (
            <CommunityImpactCard key={impact.id} impact={impact} />
          ))}
        </div>
      </section>

      <section className="lgnd-page__future-ready institute-glass">
        <h2>Future-ready capabilities</h2>
        <p>{LEGACY_ENDOWMENT_FUTURE_READY_COPY}</p>
        <ul className="lgnd-page__prepared-list">
          {FUTURE_READY_ENDOWMENT_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.title}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="lgnd-page__reserved-note institute-glass">
        <p>{LEGACY_ENDOWMENT_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
