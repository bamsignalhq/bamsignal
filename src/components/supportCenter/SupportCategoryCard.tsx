import type { SupportTicketCategoryId } from "../../constants/supportCenter";
import { SUPPORT_TICKET_CATEGORY_LABELS } from "../../constants/supportCenter";
import { navigateToPath } from "../../constants/routes";
import { supportCenterPathForRoute } from "../../constants/supportCenterRoutes";

type SupportCategoryCardProps = {
  categoryId: SupportTicketCategoryId;
  hint: string;
};

export function SupportCategoryCard({ categoryId, hint }: SupportCategoryCardProps) {
  return (
    <article className="support-category-card cc-reveal">
      <h3>{SUPPORT_TICKET_CATEGORY_LABELS[categoryId]}</h3>
      <p>{hint}</p>
      <button
        type="button"
        className="support-center-btn support-center-btn--ghost"
        onClick={() => navigateToPath(supportCenterPathForRoute("contact"))}
      >
        Get help
      </button>
    </article>
  );
}
