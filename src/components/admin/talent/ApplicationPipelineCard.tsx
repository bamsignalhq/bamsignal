import { TALENT_PIPELINE_STAGE_LABELS } from "../../../constants/talentRecruiting";
import type { TalentPipelineBucket, TalentPipelineStageId } from "../../../types/talentRecruiting";

type ApplicationPipelineCardProps = {
  pipeline: TalentPipelineBucket[];
  activeStage: TalentPipelineStageId;
  onSelectStage: (stage: TalentPipelineStageId) => void;
  onSelectCandidate: (candidateId: string) => void;
  selectedCandidateId: string | null;
};

export function ApplicationPipelineCard({
  pipeline,
  activeStage,
  onSelectStage,
  onSelectCandidate,
  selectedCandidateId
}: ApplicationPipelineCardProps) {
  const activeBucket = pipeline.find((bucket) => bucket.stage === activeStage);

  return (
    <section className="talent-pipeline-card concierge-consultant-card--glass cc-reveal">
      <header className="talent-pipeline-card__head">
        <h3>Recruiting pipeline</h3>
        <p>Applications through hired, rejected, and talent pool.</p>
      </header>

      <div className="talent-pipeline-card__stages">
        {pipeline.map((bucket) => (
          <button
            key={bucket.stage}
            type="button"
            className={`talent-pipeline-chip${activeStage === bucket.stage ? " is-active" : ""}`}
            onClick={() => onSelectStage(bucket.stage)}
          >
            {TALENT_PIPELINE_STAGE_LABELS[bucket.stage]}
            <span>{bucket.candidates.length}</span>
          </button>
        ))}
      </div>

      <div className="talent-pipeline-card__list">
        {activeBucket?.candidates.length ? (
          activeBucket.candidates.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              className={`talent-pipeline-row${selectedCandidateId === candidate.id ? " is-selected" : ""}`}
              onClick={() => onSelectCandidate(candidate.id)}
            >
              <strong>{candidate.name}</strong>
              <span>{candidate.roleTitle}</span>
              <span>{candidate.location}</span>
            </button>
          ))
        ) : (
          <p className="talent-pipeline-card__empty">No candidates in this stage.</p>
        )}
      </div>
    </section>
  );
}
