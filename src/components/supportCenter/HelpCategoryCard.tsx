import type { SupportTicketTypeId } from "../../constants/supportCenter";
import { SUPPORT_TICKET_TYPE_LABELS } from "../../constants/supportCenter";
import { navigateToPath } from "../../constants/routes";
import { supportCenterPathForRoute } from "../../constants/supportCenterRoutes";

type HelpCategoryCardProps = {
  typeId: SupportTicketTypeId;
  hint: string;
};

export function HelpCategoryCard({ typeId, hint }: HelpCategoryCardProps) {
  return (
    <article className="support-category-card cc-reveal">
      <h3>{SUPPORT_TICKET_TYPE_LABELS[typeId]}</h3>
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
