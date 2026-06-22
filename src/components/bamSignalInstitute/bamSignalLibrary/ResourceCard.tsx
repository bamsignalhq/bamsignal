import {
  BAMSIGNAL_LIBRARY_LABEL,
  LIBRARY_RESOURCE_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/bamSignalLibrary";
import type { ResourceViewModel } from "../../../utils/bamSignalLibraryLogic";

type ResourceCardProps = {
  resource: ResourceViewModel;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <article className="bsl-resource-card institute-glass">
      <header className="bsl-resource-card__head">
        <h3>{resource.title}</h3>
        <span className="bsl-resource-card__badge">{LIBRARY_RESOURCE_LABEL}</span>
      </header>

      <p className="bsl-resource-card__category">{resource.categoryTitle}</p>
      <p className="bsl-resource-card__labels">
        {BAMSIGNAL_LIBRARY_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="bsl-resource-card__description">{resource.description}</p>
      <p className="bsl-resource-card__status">{resource.statusLabel}</p>
    </article>
  );
}
