import { GOVERNANCE_POLICY_LABELS } from "../../../constants/institutionalGovernance";
import type {
  InstitutionalPolicyRecord,
  PolicyAcknowledgementRecord
} from "../../../types/institutionalGovernance";

type PolicyAcknowledgementCardProps = {
  policies: InstitutionalPolicyRecord[];
  acknowledgements: PolicyAcknowledgementRecord[];
};

export function PolicyAcknowledgementCard({
  policies,
  acknowledgements
}: PolicyAcknowledgementCardProps) {
  return (
    <section className="governance-card policy-acknowledgement-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Policy acknowledgement</h3>
        <p>Digital acknowledgement with version, timestamp, and IP for every required policy.</p>
      </header>
      <ul className="policy-acknowledgement-card__policies">
        {policies.map((policy) => (
          <li key={policy.id}>
            <strong>{GOVERNANCE_POLICY_LABELS[policy.slug]}</strong>
            <span>v{policy.version}</span>
          </li>
        ))}
      </ul>
      <ul className="policy-acknowledgement-card__acks">
        {acknowledgements.map((ack) => (
          <li key={ack.id}>
            <strong>{ack.operatorEmail}</strong>
            <span>
              {GOVERNANCE_POLICY_LABELS[ack.policySlug]} v{ack.policyVersion}
            </span>
            <span>{new Date(ack.acknowledgedAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
