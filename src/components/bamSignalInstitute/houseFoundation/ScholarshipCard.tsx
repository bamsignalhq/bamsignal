import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, SCHOLARSHIP_LABEL } from "../../../constants/houseFoundation";
import type { ScholarshipCardViewModel } from "../../../utils/houseFoundationLogic";

type ScholarshipCardProps = {
  scholarship: ScholarshipCardViewModel;
};

export function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  return (
    <article className="hfnd-scholarship-card institute-glass">
      <header className="hfnd-scholarship-card__head">
        <h3>{scholarship.title}</h3>
        <span className="hfnd-scholarship-card__badge">{SCHOLARSHIP_LABEL}</span>
      </header>
      <p className="hfnd-scholarship-card__order">Program {scholarship.programOrder}</p>
      <p className="hfnd-scholarship-card__description">{scholarship.description}</p>
      <p className="hfnd-scholarship-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hfnd-scholarship-card__status">{scholarship.statusLabel}</p>
    </article>
  );
}
