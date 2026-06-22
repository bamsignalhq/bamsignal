import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, RESEARCH_LABEL } from "../../../constants/houseInstitute";
import type { ResearchCardViewModel } from "../../../utils/houseInstituteLogic";

type ResearchCardProps = {
  research: ResearchCardViewModel;
};

export function ResearchCard({ research }: ResearchCardProps) {
  return (
    <article className="hins-research-card institute-glass">
      <header className="hins-research-card__head">
        <h3>{research.title}</h3>
        <span className="hins-research-card__badge">{RESEARCH_LABEL}</span>
      </header>
      <p className="hins-research-card__order">Program {research.programOrder}</p>
      <p className="hins-research-card__description">{research.description}</p>
      <p className="hins-research-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hins-research-card__status">{research.statusLabel}</p>
    </article>
  );
}
