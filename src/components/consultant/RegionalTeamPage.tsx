import { useCallback, useEffect, useMemo, useState } from "react";
import {
  REGIONAL_CONSULTANT_TEAMS_BRAND,
  REGIONAL_CONSULTANT_TEAMS_FUTURE_MODULES,
  REGIONAL_CONSULTANT_TEAM_REGIONS,
  REGIONAL_CONSULTANT_TEAMS_TAGLINE,
  REGIONAL_TEAM_ROLE_DEFINITIONS,
  type RegionalTeamId
} from "../../constants/regionalConsultantTeams";
import { EMPTY_CONCIERGE_FILTERS } from "../../types/conciergeConsultant";
import { fetchAdminConciergeConsultants, fetchAdminConciergeMembers } from "../../services/adminConcierge";
import type { RegionalConsultantTeamsBundle, RegionalTeamWorkloadRow } from "../../types/regionalConsultantTeams";
import { buildRegionalConsultantTeamsBundle } from "../../utils/regionalConsultantEngine";
import { getRegionalTeamSnapshot } from "../../utils/regionalConsultantLogic";
import { RegionalAssignmentCard } from "./RegionalAssignmentCard";
import { RegionalCoverageCard } from "./RegionalCoverageCard";
import { RegionalDirectorCard } from "./RegionalDirectorCard";
import { RegionalTeamCard } from "./RegionalTeamCard";
import { RegionalWorkloadCard } from "./RegionalWorkloadCard";

function emptyBundle(): RegionalConsultantTeamsBundle {
  return buildRegionalConsultantTeamsBundle({ consultants: [], members: [] });
}

function RegionalConsultantWorkloadList({ rows }: { rows: RegionalTeamWorkloadRow[] }) {
  if (rows.length === 0) {
    return <p className="concierge-consultant__empty">No consultant workload in this region yet.</p>;
  }

  return (
    <ul className="regional-consultant-workload__list">
      {rows.map((row) => (
        <li key={row.consultantId}>
          <div>
            <strong>{row.name}</strong>
            <span>{row.roleLabel}</span>
          </div>
          <p>{row.summary}</p>
          <em className={`regional-consultant-workload__health regional-consultant-workload__health--${row.health}`}>
            {row.health}
          </em>
        </li>
      ))}
    </ul>
  );
}

export function RegionalTeamPage() {
  const [loading, setLoading] = useState(true);
  const [bundle, setBundle] = useState<RegionalConsultantTeamsBundle>(emptyBundle);
  const [activeRegion, setActiveRegion] = useState<RegionalTeamId>("lagos");

  const loadTeams = useCallback(async () => {
    setLoading(true);
    const [memberResult, consultantResult] = await Promise.all([
      fetchAdminConciergeMembers(EMPTY_CONCIERGE_FILTERS),
      fetchAdminConciergeConsultants()
    ]);
    setBundle(
      buildRegionalConsultantTeamsBundle({
        consultants: consultantResult.consultants,
        members: memberResult.members
      })
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadTeams();
  }, [loadTeams]);

  const snapshot = useMemo(
    () => getRegionalTeamSnapshot(bundle, activeRegion),
    [bundle, activeRegion]
  );

  if (loading) {
    return (
      <div className="regional-teams-page">
        <p className="concierge-consultant__empty">Loading regional teams…</p>
      </div>
    );
  }

  return (
    <div className="regional-teams-page">
      <header className="regional-teams-page__head">
        <p className="regional-teams-page__eyebrow">{REGIONAL_CONSULTANT_TEAMS_BRAND}</p>
        <h2>Regional Workspace</h2>
        <p>{REGIONAL_CONSULTANT_TEAMS_TAGLINE}</p>
        <time className="regional-teams-page__updated" dateTime={bundle.updatedAt}>
          Updated {new Date(bundle.updatedAt).toLocaleString()}
        </time>
      </header>

      <div className="regional-teams-page__regions" role="tablist" aria-label="Regions">
        {REGIONAL_CONSULTANT_TEAM_REGIONS.map((region) => {
          const team = bundle.teams.find((entry) => entry.regionId === region.id);
          return (
            <button
              key={region.id}
              type="button"
              role="tab"
              aria-selected={activeRegion === region.id}
              className={`regional-teams-page__region-chip${
                activeRegion === region.id ? " regional-teams-page__region-chip--active" : ""
              }`}
              onClick={() => setActiveRegion(region.id)}
            >
              <span>{region.label}</span>
              <em>{team?.metrics.consultants ?? 0}</em>
            </button>
          );
        })}
      </div>

      {snapshot ? (
        <div className="regional-teams-page__grid">
          <RegionalDirectorCard director={snapshot.director} regionLabel={snapshot.regionLabel} />
          <RegionalWorkloadCard regionLabel={snapshot.regionLabel} metrics={snapshot.metrics} />
          <RegionalTeamCard regionLabel={snapshot.regionLabel} consultants={snapshot.consultants} />
          <section className="regional-consultant-workload concierge-consultant-card concierge-consultant-card--glass cc-reveal">
            <header className="concierge-consultant-card__head">
              <h3>Consultant Workload</h3>
              <p>Active caseload across {snapshot.regionLabel}.</p>
            </header>
            <RegionalConsultantWorkloadList rows={snapshot.workload} />
          </section>
          <RegionalCoverageCard regionLabel={snapshot.regionLabel} coverage={snapshot.coverage} />
          <RegionalAssignmentCard regionLabel={snapshot.regionLabel} assignments={snapshot.assignments} />
        </div>
      ) : null}

      <section className="regional-teams-page__roles concierge-consultant-card concierge-consultant-card--glass cc-reveal">
        <header className="concierge-consultant-card__head">
          <h3>Team Roles</h3>
          <p>Architecture for expanding beyond a single consultant group.</p>
        </header>
        <ul className="regional-teams-page__role-list">
          {REGIONAL_TEAM_ROLE_DEFINITIONS.map((role) => (
            <li key={role.id}>
              <strong>{role.label}</strong>
              <span>{role.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <aside className="regional-teams-future" aria-label="Future regional modules">
        <p className="regional-teams-future__label">Future-ready</p>
        <ul>
          {REGIONAL_CONSULTANT_TEAMS_FUTURE_MODULES.map((module) => (
            <li key={module.id}>
              <strong>{module.label}</strong>
              <span>{module.description}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
