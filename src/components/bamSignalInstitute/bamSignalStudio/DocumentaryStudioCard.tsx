import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  DOCUMENTARY_STUDIO_LABEL
} from "../../../constants/bamSignalStudio";
import type { DocumentaryStudioCardViewModel } from "../../../utils/bamSignalStudioLogic";

type DocumentaryStudioCardProps = {
  production: DocumentaryStudioCardViewModel;
};

export function DocumentaryStudioCard({ production }: DocumentaryStudioCardProps) {
  return (
    <article className="bstu-documentary-card institute-glass">
      <header className="bstu-documentary-card__head">
        <h3>{production.title}</h3>
        <span className="bstu-documentary-card__badge">{DOCUMENTARY_STUDIO_LABEL}</span>
      </header>
      <p className="bstu-documentary-card__description">{production.description}</p>
      <p className="bstu-documentary-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="bstu-documentary-card__status">{production.statusLabel}</p>
    </article>
  );
}
