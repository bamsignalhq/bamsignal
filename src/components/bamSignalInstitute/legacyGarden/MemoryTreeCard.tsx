import {
  BAMSIGNAL_HOUSE_FORBIDDEN_COPY,
  MEMORY_TREE_LABEL
} from "../../../constants/legacyGarden";
import type { MemoryTreeCardViewModel } from "../../../utils/legacyGardenLogic";

type MemoryTreeCardProps = {
  memory: MemoryTreeCardViewModel;
};

export function MemoryTreeCard({ memory }: MemoryTreeCardProps) {
  return (
    <article className="lgdn-tree-card institute-glass">
      <header className="lgdn-tree-card__head">
        <h3>{memory.title}</h3>
        <span className="lgdn-tree-card__badge">{MEMORY_TREE_LABEL}</span>
      </header>
      <p className="lgdn-tree-card__description">{memory.description}</p>
      <p className="lgdn-tree-card__forbidden">
        Not {BAMSIGNAL_HOUSE_FORBIDDEN_COPY.join(", ")}.
      </p>
      <p className="lgdn-tree-card__status">{memory.statusLabel}</p>
    </article>
  );
}
