import type { CareerCategoryId } from "../../constants/careers";
import { CAREER_CATEGORY_LABELS } from "../../constants/careers";
import { navigateToPath } from "../../constants/routes";
import { careersPathForHub } from "../../constants/careersRoutes";

type CareerCategoryCardProps = {
  categoryId: CareerCategoryId;
  hint: string;
  roleCount: number;
};

export function CareerCategoryCard({ categoryId, hint, roleCount }: CareerCategoryCardProps) {
  return (
    <article className="careers-category-card cc-reveal">
      <p className="careers-category-card__eyebrow">{CAREER_CATEGORY_LABELS[categoryId]}</p>
      <h3>{CAREER_CATEGORY_LABELS[categoryId]}</h3>
      <p>{hint}</p>
      <footer>
        <span>{roleCount} open {roleCount === 1 ? "role" : "roles"}</span>
        <button
          type="button"
          className="careers-btn careers-btn--ghost"
          onClick={() => navigateToPath(careersPathForHub("landing"))}
        >
          View roles
        </button>
      </footer>
    </article>
  );
}
