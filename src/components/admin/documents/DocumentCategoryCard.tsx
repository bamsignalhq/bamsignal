import type { DocumentCategoryId } from "../../../constants/documentCenter";
import { DOCUMENT_CATEGORY_LABELS } from "../../../constants/documentCenter";

type DocumentCategoryCardProps = {
  categoryId: DocumentCategoryId;
  hint: string;
  count: number;
  active?: boolean;
  onSelect?: () => void;
};

export function DocumentCategoryCard({
  categoryId,
  hint,
  count,
  active = false,
  onSelect
}: DocumentCategoryCardProps) {
  return (
    <button
      type="button"
      className={`document-category-card${active ? " is-active" : ""}`}
      onClick={onSelect}
    >
      <p className="document-category-card__eyebrow">{DOCUMENT_CATEGORY_LABELS[categoryId]}</p>
      <h3>{DOCUMENT_CATEGORY_LABELS[categoryId]}</h3>
      <p>{hint}</p>
      <span>{count} documents</span>
    </button>
  );
}
