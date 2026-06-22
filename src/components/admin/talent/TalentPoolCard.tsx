import type { TalentCandidateRecord } from "../../../types/talentRecruiting";

type TalentPoolCardProps = {
  candidates: TalentCandidateRecord[];
  onSelectCandidate: (candidateId: string) => void;
  selectedCandidateId: string | null;
};

export function TalentPoolCard({ candidates, onSelectCandidate, selectedCandidateId }: TalentPoolCardProps) {
  return (
    <section className="talent-pool-card concierge-consultant-card--glass cc-reveal">
      <header className="talent-pool-card__head">
        <h3>Talent pool</h3>
        <p>Strong candidates held for future roles.</p>
      </header>

      {candidates.length ? (
        <div className="talent-pool-card__list">
          {candidates.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              className={`talent-pool-row${selectedCandidateId === candidate.id ? " is-selected" : ""}`}
              onClick={() => onSelectCandidate(candidate.id)}
            >
              <strong>{candidate.name}</strong>
              <span>{candidate.roleTitle}</span>
              <span>{candidate.note}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="talent-pool-card__empty">No candidates in the talent pool yet.</p>
      )}
    </section>
  );
}
