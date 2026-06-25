import { useMemo, useState } from "react";
import {
  WORKFORCE_MANAGEMENT_ADMIN_BRAND,
  WORKFORCE_MANAGEMENT_ADMIN_PATH
} from "../../../constants/workforceAdmin";
import { WORKFORCE_FUTURE_REGIONS } from "../../../constants/workforceManagement";
import { buildWorkforceManagementBundle } from "../../../utils/workforceManagementEngine";
import { AssignmentRecommendationCard } from "./AssignmentRecommendationCard";
import { AvailabilityCalendarCard } from "./AvailabilityCalendarCard";
import { CapacityHeatmapCard } from "./CapacityHeatmapCard";
import { ConsultantWorkloadCard } from "./ConsultantWorkloadCard";
import { LeaveManagementCard } from "./LeaveManagementCard";
import { RegionalTeamCard } from "./RegionalTeamCard";
import { StaffingForecastCard } from "./StaffingForecastCard";
import { TransferHistoryCard } from "./TransferHistoryCard";
import { WorkforceOverviewCard } from "./WorkforceOverviewCard";

export function WorkforceManagementPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildWorkforceManagementBundle();
  }, [refreshKey]);

  const profileNames = Object.fromEntries(
    bundle.profiles.map((profile) => [profile.id, profile.displayName])
  );

  return (
    <div className="workforce-management-page">
      <header className="workforce-management-page__head">
        <div>
          <h2>{WORKFORCE_MANAGEMENT_ADMIN_BRAND}</h2>
          <p>
            Operational capacity engine for consultant workloads, staffing levels, availability,
            handoffs, absences, regional assignments, and workforce planning. Admin retains final
            assignment authority.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh
        </button>
      </header>

      <WorkforceOverviewCard metrics={bundle.overviewMetrics} />

      <div className="workforce-management-page__body">
        <div className="workforce-management-page__column">
          <CapacityHeatmapCard heatmap={bundle.heatmap} />
          <AvailabilityCalendarCard
            availability={bundle.availability}
            profileNames={profileNames}
          />
          <LeaveManagementCard leaveRequests={bundle.leaveRequests} profileNames={profileNames} />
          <RegionalTeamCard
            profiles={bundle.profiles}
            regionalAssignments={bundle.regionalAssignments}
          />
        </div>

        <div className="workforce-management-page__column">
          <AssignmentRecommendationCard recommendations={bundle.recommendations} />
          <ConsultantWorkloadCard profiles={bundle.profiles} capacity={bundle.capacity} />
          <TransferHistoryCard transfers={bundle.transfers} profileNames={profileNames} />
          <StaffingForecastCard forecasts={bundle.forecasts} />
        </div>
      </div>

      <footer className="workforce-management-page__meta">
        <span>Route: {WORKFORCE_MANAGEMENT_ADMIN_PATH}</span>
        <span>
          Future regions documented only:{" "}
          {WORKFORCE_FUTURE_REGIONS.map((region) => region.label).join(", ")}
        </span>
        <span>Generated {new Date(bundle.generatedAt).toLocaleString()}</span>
      </footer>
    </div>
  );
}
