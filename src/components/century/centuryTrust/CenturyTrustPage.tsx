import { useMemo } from "react";
import {
  CENTURY_TRUST_FUTURE_MODULES,
  CENTURY_TRUST_LABEL,
  CENTURY_TRUST_LAYERS,
  CENTURY_TRUST_PURPOSE_COPY,
  CENTURY_TRUST_RESERVED_COPY,
  CENTURY_TRUST_SUBCOPY,
  CENTURY_TRUST_TITLE,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/centuryTrust";
import { getCenturyTrustBundle } from "../../../utils/CenturyTrustEngine";
import { CenturyTrustCard } from "./CenturyTrustCard";
import { FutureGenerationCard } from "./FutureGenerationCard";
import { TrustPrinciplesCard } from "./TrustPrinciplesCard";
import { TrustPurposeCard } from "./TrustPurposeCard";
import { TrustTimelineCard } from "./TrustTimelineCard";

export function CenturyTrustPage() {
  const bundle = useMemo(() => getCenturyTrustBundle(), []);

  return (
    <div className="ctrust-page">
      <header className="ctrust-page__hero institute-glass">
        <p className="bi-page__eyebrow">{CENTURY_TRUST_LABEL}</p>
        <h1>{CENTURY_TRUST_TITLE}</h1>
        <p>{CENTURY_TRUST_SUBCOPY}</p>
        <p className="ctrust-page__labels">
          {UNDERSTANDING_RELATIONSHIPS_LABEL} · 100-Year Thinking · Generational Stewardship
        </p>
        <p className="ctrust-page__purpose">{CENTURY_TRUST_PURPOSE_COPY}</p>
      </header>

      <section className="ctrust-page__section">
        <TrustPurposeCard purpose={bundle.purpose} />
      </section>

      <section className="ctrust-page__prepared institute-glass">
        <h2>Trust layers</h2>
        <p>{bundle.layerCount} trust layers — architecture preview, not legal or financial.</p>
        <ul className="ctrust-page__prepared-list">
          {CENTURY_TRUST_LAYERS.map((layer) => (
            <li key={layer.id}>
              <strong>{layer.title}</strong>
              <span>{layer.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ctrust-page__section">
        <header className="bi-section-head">
          <h2>Century trust layers</h2>
          <p>Mission through Institution — preserving Century Room vision across generations.</p>
        </header>
        <div className="ctrust-page__grid">
          {bundle.layers.map((layer) => (
            <CenturyTrustCard key={layer.id} layer={layer} />
          ))}
        </div>
      </section>

      <section className="ctrust-page__section ctrust-page__split">
        <TrustPrinciplesCard principles={bundle.principles} />
        <TrustTimelineCard entries={bundle.timeline} />
      </section>

      <section className="ctrust-page__section">
        <FutureGenerationCard futureGeneration={bundle.futureGeneration} />
      </section>

      <section className="ctrust-page__future institute-glass">
        <h2>Future ready</h2>
        <ul>
          {CENTURY_TRUST_FUTURE_MODULES.map((module) => (
            <li key={module.id}>
              <strong>{module.label}</strong>
              <span>{module.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ctrust-page__reserved-note institute-glass">
        <p>{CENTURY_TRUST_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
