import { CAREER_CATEGORY_LABELS } from "../../../constants/careers";
import { TALENT_PIPELINE_STAGE_LABELS, TALENT_PIPELINE_STAGES } from "../../../constants/talentRecruiting";
import type { TalentCandidateRecord, TalentPipelineStageId } from "../../../types/talentRecruiting";

type CandidateProfileCardProps = {
  candidate: TalentCandidateRecord | null;
  onMoveStage: (stage: TalentPipelineStageId) => void;
};

export function CandidateProfileCard({ candidate, onMoveStage }: CandidateProfileCardProps) {
  if (!candidate) {
    return (
      <section className="talent-candidate-card concierge-consultant-card--glass cc-reveal">
        <p className="talent-candidate-card__empty">Select a candidate to review profile and stage.</p>
      </section>
    );
  }

  return (
    <section className="talent-candidate-card concierge-consultant-card--glass cc-reveal">
      <header className="talent-candidate-card__head">
        <div>
          <h3>{candidate.name}</h3>
          <p>{candidate.roleTitle}</p>
        </div>
        {candidate.starred ? <span className="talent-candidate-card__star">Starred</span> : null}
      </header>

      <dl className="talent-candidate-card__grid">
        <div>
          <dt>Email</dt>
          <dd>{candidate.email}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{CAREER_CATEGORY_LABELS[candidate.categoryId]}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{candidate.location}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>{candidate.source}</dd>
        </div>
        <div>
          <dt>Stage</dt>
          <dd>{TALENT_PIPELINE_STAGE_LABELS[candidate.stage]}</dd>
        </div>
        <div>
          <dt>Applied</dt>
          <dd>{new Date(candidate.appliedAt).toLocaleDateString()}</dd>
        </div>
      </dl>

      {candidate.note ? <p className="talent-candidate-card__note">{candidate.note}</p> : null}

      <div className="talent-candidate-card__actions">
        {TALENT_PIPELINE_STAGES.map((stage) => (
          <button
            key={stage.id}
            type="button"
            className={`concierge-consultant-btn${candidate.stage === stage.id ? " is-active" : ""}`}
            disabled={candidate.stage === stage.id}
            onClick={() => onMoveStage(stage.id)}
          >
            {stage.label}
          </button>
        ))}
      </div>
    </section>
  );
}
