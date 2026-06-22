import { useMemo } from "react";
import {
  DIASPORA_SERVICES_LABEL,
  DIASPORA_SERVICES_PURPOSE_COPY,
  DIASPORA_SERVICES_RESERVED_COPY,
  DIASPORA_SERVICES_SUBCOPY,
  DIASPORA_SERVICES_TITLE,
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_DIASPORA_SERVICES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/diasporaServices";
import { getDiasporaServicesBundle } from "../../../utils/DiasporaServicesEngine";
import { DiasporaAdvisorCard } from "./DiasporaAdvisorCard";
import { ImmigrationPartnerCard } from "./ImmigrationPartnerCard";

export function DiasporaServicesPage() {
  const bundle = useMemo(() => getDiasporaServicesBundle(), []);

  return (
    <div className="dias-page">
      <header className="dias-page__hero institute-glass">
        <p className="bi-page__eyebrow">{DIASPORA_SERVICES_LABEL}</p>
        <h1>{DIASPORA_SERVICES_TITLE}</h1>
        <p>{DIASPORA_SERVICES_SUBCOPY}</p>
        <p className="dias-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="dias-page__purpose">{DIASPORA_SERVICES_PURPOSE_COPY}</p>
      </header>

      <section className="dias-page__prepared institute-glass">
        <h2>Prepared services</h2>
        <p>{bundle.serviceCount} services — architecture preview, not live yet.</p>
        <ul className="dias-page__prepared-list">
          {PREPARED_DIASPORA_SERVICES.map((service) => (
            <li key={service.id}>
              <strong>{service.title}</strong>
              <span>{service.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="dias-page__section">
        <header className="bi-section-head">
          <h2>Immigration partners</h2>
          <p>Reserved partners — prepared, not enabled yet.</p>
        </header>
        <div className="dias-page__grid">
          {bundle.partners.map((partner) => (
            <ImmigrationPartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      </section>

      <section className="dias-page__section">
        <header className="bi-section-head">
          <h2>Diaspora advisors</h2>
          <p>Reserved advisors — cross-border guidance, not referrals yet.</p>
        </header>
        <div className="dias-page__grid">
          {bundle.advisors.map((advisor) => (
            <DiasporaAdvisorCard key={advisor.id} advisor={advisor} />
          ))}
        </div>
      </section>

      <section className="dias-page__reserved-note institute-glass">
        <p>{DIASPORA_SERVICES_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
