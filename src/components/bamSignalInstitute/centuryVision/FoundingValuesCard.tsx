import {
  CENTURY_VISION_FORBIDDEN_COPY,
  FOUNDING_VALUES_LABEL
} from "../../../constants/centuryVision";
import type { FoundingValuesViewModel } from "../../../utils/centuryVisionLogic";

type FoundingValuesCardProps = {
  values: FoundingValuesViewModel;
};

export function FoundingValuesCard({ values }: FoundingValuesCardProps) {
  return (
    <article className="cvis-values-card institute-glass">
      <header className="cvis-values-card__head">
        <h3>{values.title}</h3>
        <span className="cvis-values-card__badge">{FOUNDING_VALUES_LABEL}</span>
      </header>
      <p className="cvis-values-card__summary">{values.summary}</p>
      <p className="cvis-values-card__forbidden">
        Not {CENTURY_VISION_FORBIDDEN_COPY.join(" or ")}.
      </p>
      <p className="cvis-values-card__status">{values.statusLabel}</p>
    </article>
  );
}
