import { useMemo } from "react";
import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  LIFE_PARTNERS_LABEL,
  LIFE_PARTNERS_PURPOSE_COPY,
  LIFE_PARTNERS_RESERVED_COPY,
  LIFE_PARTNERS_SUBCOPY,
  LIFE_PARTNERS_TITLE,
  PREPARED_LIFE_PARTNER_SPECIALTIES,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/lifePartners";
import { getLifePartnersBundle } from "../../../utils/LifePartnersEngine";
import { LegacyAdvisorCard } from "./LegacyAdvisorCard";
import { LifePartnerCard } from "./LifePartnerCard";

export function LifePartnersPage() {
  const bundle = useMemo(() => getLifePartnersBundle(), []);

  return (
    <div className="lpr-page">
      <header className="lpr-page__hero institute-glass">
        <p className="bi-page__eyebrow">{LIFE_PARTNERS_LABEL}</p>
        <h1>{LIFE_PARTNERS_TITLE}</h1>
        <p>{LIFE_PARTNERS_SUBCOPY}</p>
        <p className="lpr-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="lpr-page__purpose">{LIFE_PARTNERS_PURPOSE_COPY}</p>
      </header>

      <section className="lpr-page__prepared institute-glass">
        <h2>Prepared specialties</h2>
        <p>{bundle.specialtyCount} specialties — architecture preview, not live yet.</p>
        <ul className="lpr-page__prepared-list">
          {PREPARED_LIFE_PARTNER_SPECIALTIES.map((specialty) => (
            <li key={specialty.id}>
              <strong>{specialty.title}</strong>
              <span>{specialty.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="lpr-page__section">
        <header className="bi-section-head">
          <h2>Life partners</h2>
          <p>Trusted stewardship partners — reserved profiles, not referrals yet.</p>
        </header>
        <div className="lpr-page__grid">
          {bundle.partners.map((partner) => (
            <LifePartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      </section>

      <section className="lpr-page__section">
        <header className="bi-section-head">
          <h2>Legacy advisors</h2>
          <p>Reserved legacy counsel — prepared, not enabled yet.</p>
        </header>
        <div className="lpr-page__grid">
          {bundle.advisors.map((advisor) => (
            <LegacyAdvisorCard key={advisor.id} advisor={advisor} />
          ))}
        </div>
      </section>

      <section className="lpr-page__reserved-note institute-glass">
        <p>{LIFE_PARTNERS_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
