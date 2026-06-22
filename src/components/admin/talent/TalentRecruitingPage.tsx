import { useCallback, useMemo, useState } from "react";
import {
  TALENT_RECRUITING_BRAND
} from "../../../constants/talentRecruiting";
import { TALENT_RECRUITING_FUTURE_KINDS } from "../../../constants/careers";
import type { TalentPipelineStageId } from "../../../types/talentRecruiting";
import {
  buildTalentRecruitingBundle,
  updateTalentCandidateStage
} from "../../../utils/talentRecruitingEngine";
import { ApplicationPipelineCard } from "./ApplicationPipelineCard";
import { CandidateProfileCard } from "./CandidateProfileCard";
import { TalentPoolCard } from "./TalentPoolCard";

export function TalentRecruitingPage() {
  const [activeStage, setActiveStage] = useState<TalentPipelineStageId>("applications");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildTalentRecruitingBundle(selectedCandidateId);
  }, [refreshKey, selectedCandidateId]);

  const selectedCandidate =
    bundle.pipeline
      .flatMap((bucket) => bucket.candidates)
      .find((candidate) => candidate.id === selectedCandidateId) ??
    bundle.selectedCandidate;

  const handleMoveStage = useCallback(
    (stage: TalentPipelineStageId) => {
      if (!selectedCandidateId) return;
      updateTalentCandidateStage(selectedCandidateId, stage);
      setActiveStage(stage);
      setRefreshKey((value) => value + 1);
    },
    [selectedCandidateId]
  );

  return (
    <div className="talent-recruiting-page">
      <header className="talent-recruiting-page__head">
        <div>
          <h2>{TALENT_RECRUITING_BRAND}</h2>
          <p>
            Internal recruiting CRM for applications, screening, interviews, offers, hired,
            rejected, and talent pool.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh
        </button>
      </header>

      <section className="talent-recruiting-page__metrics" aria-label="Pipeline metrics">
        {bundle.metrics.map((metric) => (
          <article key={metric.id} className="talent-metric-card concierge-consultant-card--glass cc-reveal">
            <p>{metric.label}</p>
            <strong>{metric.count}</strong>
          </article>
        ))}
      </section>

      <div className="talent-recruiting-page__body">
        <ApplicationPipelineCard
          pipeline={bundle.pipeline}
          activeStage={activeStage}
          onSelectStage={setActiveStage}
          onSelectCandidate={setSelectedCandidateId}
          selectedCandidateId={selectedCandidateId}
        />
        <CandidateProfileCard candidate={selectedCandidate ?? null} onMoveStage={handleMoveStage} />
        <TalentPoolCard
          candidates={bundle.talentPool}
          onSelectCandidate={setSelectedCandidateId}
          selectedCandidateId={selectedCandidateId}
        />
      </div>

      <footer className="talent-recruiting-page__future">
        <h3>Future-ready</h3>
        <p>Documented only — not implemented in this release.</p>
        <ul>
          {TALENT_RECRUITING_FUTURE_KINDS.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
