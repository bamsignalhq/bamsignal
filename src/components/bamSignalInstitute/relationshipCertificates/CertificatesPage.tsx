import { useMemo } from "react";
import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREPARED_CERTIFICATES,
  RELATIONSHIP_CERTIFICATES_LABEL,
  RELATIONSHIP_CERTIFICATES_PURPOSE_COPY,
  RELATIONSHIP_CERTIFICATES_RESERVED_COPY,
  RELATIONSHIP_CERTIFICATES_SUBCOPY,
  RELATIONSHIP_CERTIFICATES_TITLE,
  RELATIONSHIP_WISDOM_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/relationshipCertificates";
import { getRelationshipCertificatesBundle } from "../../../utils/RelationshipCertificatesEngine";
import { AchievementBadge } from "./AchievementBadge";
import { CertificateCard } from "./CertificateCard";

export function CertificatesPage() {
  const bundle = useMemo(() => getRelationshipCertificatesBundle(), []);

  return (
    <div className="rcert-page">
      <header className="rcert-page__hero institute-glass">
        <p className="bi-page__eyebrow">{RELATIONSHIP_CERTIFICATES_LABEL}</p>
        <h1>{RELATIONSHIP_CERTIFICATES_TITLE}</h1>
        <p>{RELATIONSHIP_CERTIFICATES_SUBCOPY}</p>
        <p className="rcert-page__labels">
          {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} ·{" "}
          {UNDERSTANDING_RELATIONSHIPS_LABEL}
        </p>
        <p className="rcert-page__purpose">{RELATIONSHIP_CERTIFICATES_PURPOSE_COPY}</p>
      </header>

      <section className="rcert-page__prepared institute-glass">
        <h2>Prepared certificates</h2>
        <p>{bundle.certificateCount} certificates — architecture preview, not issued yet.</p>
        <ul className="rcert-page__prepared-list">
          {PREPARED_CERTIFICATES.map((certificate) => (
            <li key={certificate.id}>
              <strong>{certificate.title}</strong>
              <span>{certificate.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rcert-page__section">
        <header className="bi-section-head">
          <h2>Certificates</h2>
          <p>Milestone recognition prepared — not enabled yet.</p>
        </header>
        <div className="rcert-page__grid">
          {bundle.certificates.map((certificate) => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      </section>

      <section className="rcert-page__section">
        <header className="bi-section-head">
          <h2>Achievement badges</h2>
          <p>Reserved badges — dignity-first recognition framing.</p>
        </header>
        <div className="rcert-page__grid">
          {bundle.badges.map((badge) => (
            <AchievementBadge key={badge.id} badge={badge} />
          ))}
        </div>
      </section>

      <section className="rcert-page__reserved-note institute-glass">
        <p>{RELATIONSHIP_CERTIFICATES_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
