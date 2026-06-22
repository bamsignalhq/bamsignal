import { useMemo } from "react";
import {
  BAMSIGNAL_FELLOWS_LABEL,
  BAMSIGNAL_FELLOWS_PURPOSE_COPY,
  BAMSIGNAL_FELLOWS_RESERVED_COPY,
  BAMSIGNAL_FELLOWS_SUBCOPY,
  BAMSIGNAL_FELLOWS_TITLE,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_FELLOW_SPECIALTIES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/bamSignalFellows";
import { getBamSignalFellowsBundle } from "../../../utils/BamSignalFellowsEngine";
import { ExpertTimeline } from "./ExpertTimeline";
import { FellowCard } from "./FellowCard";

export function FellowsPage() {
  const bundle = useMemo(() => getBamSignalFellowsBundle(), []);

  return (
    <div className="bsf-page">
      <header className="bsf-page__hero institute-glass">
        <p className="bi-page__eyebrow">{BAMSIGNAL_FELLOWS_LABEL}</p>
        <h1>{BAMSIGNAL_FELLOWS_TITLE}</h1>
        <p>{BAMSIGNAL_FELLOWS_SUBCOPY}</p>
        <p className="bsf-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="bsf-page__purpose">{BAMSIGNAL_FELLOWS_PURPOSE_COPY}</p>
      </header>

      <section className="bsf-page__prepared institute-glass">
        <h2>Prepared specialties</h2>
        <p>{bundle.specialtyCount} specialties — architecture preview, not live yet.</p>
        <ul className="bsf-page__prepared-list">
          {PREPARED_FELLOW_SPECIALTIES.map((specialty) => (
            <li key={specialty.id}>
              <strong>{specialty.title}</strong>
              <span>{specialty.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bsf-page__section">
        <header className="bi-section-head">
          <h2>Fellows</h2>
          <p>Expert network prepared — not enabled yet.</p>
        </header>
        <div className="bsf-page__grid">
          {bundle.fellows.map((fellow) => (
            <FellowCard key={fellow.id} fellow={fellow} />
          ))}
        </div>
      </section>

      {bundle.fellows.map((fellow) => (
        <ExpertTimeline
          key={`${fellow.id}-timeline`}
          title={fellow.specialtyTitle}
          entries={fellow.timeline}
        />
      ))}

      <section className="bsf-page__reserved-note institute-glass">
        <p>{BAMSIGNAL_FELLOWS_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
