import type { InstitutionCommitmentCardViewModel } from "../../../types/governanceFramework";

type InstitutionCommitmentCardProps = {
  commitments: InstitutionCommitmentCardViewModel[];
};

export function InstitutionCommitmentCard({ commitments }: InstitutionCommitmentCardProps) {
  return (
    <section className="govf-commitment-card institute-glass">
      <header className="govf-card__head">
        <h2>Institution commitments</h2>
        <p>Commitments that bind products, operations, research, and legacy — architecture only.</p>
      </header>
      <ul className="govf-commitment-card__list">
        {commitments.map((commitment) => (
          <li key={commitment.id}>
            <header>
              <strong>{commitment.title}</strong>
              <span className="govf-commitment-card__badge">{commitment.commitmentLabel}</span>
            </header>
            <p>{commitment.description}</p>
            <small>{commitment.statusLabel}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
