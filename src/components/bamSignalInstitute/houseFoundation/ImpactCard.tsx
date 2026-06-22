import { BAMSIGNAL_HOUSE_FORBIDDEN_COPY, IMPACT_LABEL } from "../../../constants/houseFoundation";
import type { ImpactCardViewModel } from "../../../utils/houseFoundationLogic";

type ImpactCardProps = {
  impact: ImpactCardViewModel;
};

export function ImpactCard({ impact }: ImpactCardProps) {
  return (
    <article className="hfnd-impact-card institute-glass">
      <header className="hfnd-impact-card__head">
        <h3>{impact.title}</h3>
        <span className="hfnd-impact-card__badge">{IMPACT_LABEL}</span>
      </header>
      <p className="hfnd-impact-card__order">Program {impact.programOrder}</p>
      <p className="hfnd-impact-card__description">{impact.description}</p>
      <p className="hfnd-impact-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="hfnd-impact-card__status">{impact.statusLabel}</p>
    </article>
  );
}
