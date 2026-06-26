import { SEARCH_QUICK_ACTIONS } from "../../../constants/searchCenter";
import { NOTIFICATION_RELIABILITY_ADMIN_PATH } from "../../../constants/notificationReliabilityAdmin";
import { REPORTING_CENTER_ADMIN_PATH } from "../../../constants/reportingCenterAdmin";
import { CONCIERGE_ADMIN_DASHBOARD_PATH } from "../../../constants/operationsCenter";

const QUICK_ACTION_PATHS: Record<string, string> = {
  "open-member": CONCIERGE_ADMIN_DASHBOARD_PATH,
  "assign-consultant": CONCIERGE_ADMIN_DASHBOARD_PATH,
  "view-journey": "/hard/journey-intelligence",
  "refund-payment": "/hard/finance",
  "export-report": REPORTING_CENTER_ADMIN_PATH,
  "retry-notification": NOTIFICATION_RELIABILITY_ADMIN_PATH
};

export function SearchQuickActionsCard() {
  return (
    <section className="search-quick-actions-card concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Quick actions</h3>
        <p>Jump directly to common operator workflows from search results.</p>
      </header>
      <div className="search-quick-actions-card__grid">
        {SEARCH_QUICK_ACTIONS.map((action) => (
          <a
            key={action.id}
            className="search-quick-action-chip"
            href={QUICK_ACTION_PATHS[action.id]}
          >
            <strong>{action.label}</strong>
            <span>{action.hint}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
