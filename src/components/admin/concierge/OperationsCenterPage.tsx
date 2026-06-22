import { useCallback, useMemo, useState } from "react";
import {
  CONCIERGE_ADMIN_DASHBOARD_PATH,
  OPERATIONS_CENTER_BRAND,
  OPERATIONS_CENTER_NAV_LABEL
} from "../../../constants/operationsCenter";
import { navigateToPath } from "../../../constants/routes";
import type { OperationsCenterSectionId } from "../../../types/operationsCenter";
import {
  buildOperationsCenterBundle,
  retryOperationsCenterNotification
} from "../../../utils/OperationsCenterEngine";
import { AssignmentQueueCard } from "./AssignmentQueueCard";
import {
  OperationsCalendarCard,
  OperationsConsultationCard
} from "./OperationsCalendarCard";
import { OperationsFollowUpCard } from "./OperationsFollowUpCard";
import { OperationsIntroductionCard } from "./OperationsIntroductionCard";
import { OperationsMetricCard } from "./OperationsMetricCard";
import { OperationsNotificationCard } from "./OperationsNotificationCard";
import { OperationsOverviewCard } from "./OperationsOverviewCard";
import { OperationsPaymentCard } from "./OperationsPaymentCard";
import { OperationsRegionalTeamsCard } from "./OperationsRegionalTeamsCard";

export function OperationsCenterPage() {
  const [activeSection, setActiveSection] = useState<OperationsCenterSectionId>("consultations");
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildOperationsCenterBundle();
  }, [refreshKey]);

  const handleRetry = useCallback((row: Parameters<typeof retryOperationsCenterNotification>[0]) => {
    retryOperationsCenterNotification(row);
    setRefreshKey((value) => value + 1);
  }, []);

  const handleAssignmentConfirmed = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  return (
    <div className="operations-center-page">
      <header className="operations-center-page__head">
        <div>
          <h2>{OPERATIONS_CENTER_BRAND}</h2>
          <p>
            Primary operational dashboard for the full concierge journey. Aggregates consultations,
            payments, scheduling, assignments, notifications, introductions, and follow-up — separate
            from Consultant CRM and member surfaces.
          </p>
        </div>
        <div className="operations-center-page__actions">
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Refresh
          </button>
          <button
            type="button"
            className="concierge-consultant-btn"
            onClick={() => navigateToPath(CONCIERGE_ADMIN_DASHBOARD_PATH)}
          >
            Signal Concierge Admin
          </button>
        </div>
      </header>

      <section className="operations-center-page__metrics" aria-label="Operations metrics">
        {bundle.metrics.map((metric) => (
          <OperationsMetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <div className="operations-center-page__body">
        <OperationsOverviewCard
          bundle={bundle}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />

        <div className="operations-center-page__detail">
          {activeSection === "consultations" ? <OperationsConsultationCard bundle={bundle} /> : null}
          {activeSection === "payments" ? <OperationsPaymentCard bundle={bundle} /> : null}
          {activeSection === "scheduling" ? <OperationsCalendarCard bundle={bundle} /> : null}
          {activeSection === "assignment-queue" ? (
            <AssignmentQueueCard bundle={bundle} onAssignmentConfirmed={handleAssignmentConfirmed} />
          ) : null}
          {activeSection === "notifications" ? (
            <OperationsNotificationCard bundle={bundle} onRetry={handleRetry} />
          ) : null}
          {activeSection === "introductions" ? <OperationsIntroductionCard bundle={bundle} /> : null}
          {activeSection === "follow-up" ? <OperationsFollowUpCard bundle={bundle} /> : null}
          {activeSection === "regional-teams" ? <OperationsRegionalTeamsCard bundle={bundle} /> : null}
        </div>
      </div>

      <footer className="operations-center-page__foot">
        <span>
          {OPERATIONS_CENTER_NAV_LABEL} · generated {new Date(bundle.generatedAt).toLocaleString()}
        </span>
      </footer>
    </div>
  );
}
