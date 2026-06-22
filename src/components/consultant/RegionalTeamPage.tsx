import { useCallback, useEffect, useMemo, useState } from "react";
import {
  REGIONAL_CONSULTANT_TEAMS_BRAND,
  REGIONAL_CONSULTANT_TEAMS_FUTURE_MODULES,
  REGIONAL_CONSULTANT_TEAM_REGIONS,
  REGIONAL_TEAM_ROLE_DEFINITIONS,
  REGIONAL_CONSULTANT_TEAMS_TAGLINE,
  type RegionalTeamId
} from "../../constants/regionalConsultantTeams";
import { EMPTY_CONCIERGE_FILTERS } from "../../types/conciergeConsultant";
import { fetchAdminConciergeConsultants, fetchAdminConciergeMembers } from "../../services/adminConcierge";
import type { RegionalConsultantTeamsBundle } from "../../types/regionalConsultantTeams";
import {
  buildRegionalConsultantTeamsBundle,
  getRegionalTeamSnapshot
} from "../../utils/regionalConsultantTeamsLogic";
import { RegionalLeadCard } from "./RegionalLeadCard";
import { RegionalMetricsCard } from "./RegionalMetricsCard";
import { RegionalTeamCard } from "./RegionalTeamCard";

function emptyBundle(): RegionalConsultantTeamsBundle {
  return buildRegionalConsultantTeamsBundle({ consultants: [], members: [] });
}

export function RegionalTeamPage() {
  const [loading, setLoading] = useState(true);
  const [bundle, setBundle] = useState<RegionalConsultantTeamsBundle>(emptyBundle);
  const [activeRegion, setActiveRegion] = useState<RegionalTeamId>("nigeria");

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
              <em>{team?.consultants.length ?? 0}</em>
            </button>
          );
        })}
      </div>

      {snapshot ? (
        <div className="regional-teams-page__grid">
          <RegionalLeadCard lead={snapshot.lead} regionLabel={snapshot.regionLabel} />
          <RegionalMetricsCard regionLabel={snapshot.regionLabel} metrics={snapshot.metrics} />
          <RegionalTeamCard regionLabel={snapshot.regionLabel} consultants={snapshot.consultants} />
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
