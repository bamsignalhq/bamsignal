import { useMemo } from "react";
import {
  BAMSIGNAL_HOUSE_LABEL,
  GROWING_TOGETHER_LABEL,
  HOUSE_FOUNDATION_LABEL,
  HOUSE_FOUNDATION_PURPOSE_COPY,
  HOUSE_FOUNDATION_RESERVED_COPY,
  HOUSE_FOUNDATION_SUBCOPY,
  HOUSE_FOUNDATION_TITLE,
  LEARNING_LABEL,
  PREPARED_HOUSE_FOUNDATION_PROGRAMS,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/houseFoundation";
import { getHouseFoundationBundle } from "../../../utils/HouseFoundationEngine";
import { ImpactCard } from "./ImpactCard";
import { ScholarshipCard } from "./ScholarshipCard";

export function HouseFoundationPage() {
  const bundle = useMemo(() => getHouseFoundationBundle(), []);

  return (
    <div className="hfnd-page">
      <header className="hfnd-page__hero institute-glass">
        <p className="bi-page__eyebrow">{HOUSE_FOUNDATION_LABEL}</p>
        <h1>{HOUSE_FOUNDATION_TITLE}</h1>
        <p>{HOUSE_FOUNDATION_SUBCOPY}</p>
        <p className="hfnd-page__labels">
          {BAMSIGNAL_HOUSE_LABEL} · {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} ·{" "}
          {RELATIONSHIP_WISDOM_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="hfnd-page__purpose">{HOUSE_FOUNDATION_PURPOSE_COPY}</p>
      </header>

      <section className="hfnd-page__prepared institute-glass">
        <h2>Programs</h2>
        <p>{bundle.programCount} foundation programs — architecture preview, not disbursements yet.</p>
        <ul className="hfnd-page__prepared-list">
          {PREPARED_HOUSE_FOUNDATION_PROGRAMS.map((program) => (
            <li key={program.id}>
              <strong>{program.title}</strong>
              <span>{program.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hfnd-page__section">
        <header className="bi-section-head">
          <h2>Scholarships</h2>
          <p>Learning support architecture — prepared, not enabled yet.</p>
        </header>
        <div className="hfnd-page__grid">
          {bundle.scholarships.map((scholarship) => (
            <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
          ))}
        </div>
      </section>

      <section className="hfnd-page__section">
        <header className="bi-section-head">
          <h2>Impact programs</h2>
          <p>Widows Support through Community Programs — architecture reserved, not live yet.</p>
        </header>
        <div className="hfnd-page__grid">
          {bundle.impactPrograms.map((impact) => (
            <ImpactCard key={impact.id} impact={impact} />
          ))}
        </div>
      </section>

      <section className="hfnd-page__reserved-note institute-glass">
        <p>{HOUSE_FOUNDATION_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
