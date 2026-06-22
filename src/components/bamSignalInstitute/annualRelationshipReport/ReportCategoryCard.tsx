import { INSIGHTS_LABEL } from "../../../constants/annualRelationshipReport";
import type { AnnualReportCategoryDefinition } from "../../../constants/annualRelationshipReport";

type ReportCategoryCardProps = {
  category: AnnualReportCategoryDefinition;
};

export function ReportCategoryCard({ category }: ReportCategoryCardProps) {
  return (
    <article className="arr-category-card institute-glass">
      <header className="arr-category-card__head">
        <h3>{category.label}</h3>
        <span className="arr-category-card__badge">{INSIGHTS_LABEL}</span>
      </header>
      <p className="arr-category-card__description">{category.description}</p>
    </article>
  );
}
