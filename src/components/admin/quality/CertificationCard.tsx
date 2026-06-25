import { CERTIFICATION_LEVEL_LABELS } from "../../../constants/consultantQuality";
import type { ConsultantCertificationRecord } from "../../../types/consultantQuality";

type CertificationCardProps = {
  certifications: ConsultantCertificationRecord[];
};

export function CertificationCard({ certifications }: CertificationCardProps) {
  const active = certifications.filter((item) => item.status === "active");
  const suspended = certifications.filter((item) => item.status === "suspended");

  return (
    <section className="quality-card certification-card concierge-consultant-card--glass cc-reveal">
      <header className="certification-card__head">
        <h3>Certification</h3>
        <p>
          Certified, Senior Certified, Master Consultant, and Legacy Consultant levels — expired and
          suspended states tracked.
        </p>
      </header>

      {active.length ? (
        <ul className="certification-card__list">
          {active.map((item) => (
            <li key={item.id}>
              <div className="certification-card__row">
                <strong>{item.consultantName}</strong>
                <span className="certification-card__level">
                  {CERTIFICATION_LEVEL_LABELS[item.certificationLevel]}
                </span>
              </div>
              <p className="certification-card__meta">
                Issued {new Date(item.issuedAt).toLocaleDateString()}
                {item.expiresAt
                  ? ` · Expires ${new Date(item.expiresAt).toLocaleDateString()}`
                  : " · No expiry"}
              </p>
              {item.notes ? <p className="certification-card__notes">{item.notes}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="certification-card__empty">No active certifications on record.</p>
      )}

      {suspended.length ? (
        <footer className="certification-card__suspended">
          <h4>Suspended ({suspended.length})</h4>
          <ul>
            {suspended.map((item) => (
              <li key={item.id}>
                {item.consultantName}
                {item.notes ? ` — ${item.notes}` : ""}
              </li>
            ))}
          </ul>
        </footer>
      ) : null}
    </section>
  );
}
