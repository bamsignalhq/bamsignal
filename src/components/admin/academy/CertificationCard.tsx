import { ACADEMY_TRACK_LABELS, CERTIFICATION_LEVEL_LABELS } from "../../../constants/consultantAcademy";
import { promotionReadinessLabel } from "../../../utils/consultantAcademyLogic";
import type { ConsultantAcademyRecord } from "../../../types/consultantAcademy";

type CertificationCardProps = {
  consultant: ConsultantAcademyRecord;
};

export function CertificationCard({ consultant }: CertificationCardProps) {
  return (
    <section className="certification-card concierge-consultant-card--glass cc-reveal">
      <header className="certification-card__head">
        <h3>Certification</h3>
      </header>

      <dl className="certification-card__grid">
        <div>
          <dt>Consultant</dt>
          <dd>{consultant.consultantName}</dd>
        </div>
        <div>
          <dt>Track</dt>
          <dd>{ACADEMY_TRACK_LABELS[consultant.trackId]}</dd>
        </div>
        <div>
          <dt>Level</dt>
          <dd>
            <span className={`certification-card__level certification-card__level--${consultant.certificationLevel}`}>
              {CERTIFICATION_LEVEL_LABELS[consultant.certificationLevel]}
            </span>
          </dd>
        </div>
        <div>
          <dt>Promotion readiness</dt>
          <dd>{promotionReadinessLabel(consultant.promotionReadiness)}</dd>
        </div>
      </dl>
    </section>
  );
}
