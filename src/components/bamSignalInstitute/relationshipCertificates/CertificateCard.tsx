import {
  CERTIFICATE_LABEL,
  LEARNING_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/relationshipCertificates";
import type { CertificateViewModel } from "../../../utils/relationshipCertificatesLogic";

type CertificateCardProps = {
  certificate: CertificateViewModel;
};

export function CertificateCard({ certificate }: CertificateCardProps) {
  return (
    <article className="rcert-certificate-card institute-glass">
      <header className="rcert-certificate-card__head">
        <h3>{certificate.title}</h3>
        <span className="rcert-certificate-card__badge">{CERTIFICATE_LABEL}</span>
      </header>

      <p className="rcert-certificate-card__labels">
        {LEARNING_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="rcert-certificate-card__badge-label">{certificate.badgeLabel}</p>
      <p className="rcert-certificate-card__description">{certificate.description}</p>
      <p className="rcert-certificate-card__status">{certificate.statusLabel}</p>
    </article>
  );
}
