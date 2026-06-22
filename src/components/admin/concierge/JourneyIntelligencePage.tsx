import { useCallback, useEffect, useMemo, useState } from "react";
import {
  JOURNEY_INTELLIGENCE_BRAND,
  JOURNEY_INTELLIGENCE_FUTURE_MODULES,
  JOURNEY_INTELLIGENCE_NAV_LABEL,
  JOURNEY_INTELLIGENCE_TAGLINE
} from "../../../constants/journeyIntelligence";
import { CONCIERGE_ADMIN_DASHBOARD_PATH } from "../../../constants/operationsCenter";
import { navigateToPath } from "../../../constants/routes";
import { fetchAdminConciergeMembers } from "../../../services/adminConcierge";
import { EMPTY_CONCIERGE_FILTERS } from "../../../types/conciergeConsultant";
import type { JourneyIntelligenceBundle } from "../../../types/journeyIntelligence";
import { listIntroductionRecords } from "../../../utils/conciergeIntroductionStore";
import { buildJourneyIntelligenceBundle } from "../../../utils/journeyIntelligenceEngine";
import { ConsultantInsightsCard } from "./ConsultantInsightsCard";
import { JourneyMetricCard } from "./JourneyMetricCard";
import { JourneyTrendCard } from "./JourneyTrendCard";
import { LegacyGrowthCard } from "./LegacyGrowthCard";
import { RegionalInsightsCard } from "./RegionalInsightsCard";

function emptyBundle(): JourneyIntelligenceBundle {
  return buildJourneyIntelligenceBundle({ members: [], introductions: [] });
}

export function JourneyIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [bundle, setBundle] = useState<JourneyIntelligenceBundle>(emptyBundle);
  const introductions = useMemo(() => listIntroductionRecords(), []);

  const loadIntelligence = useCallback(async () => {
    setLoading(true);
    const result = await fetchAdminConciergeMembers(EMPTY_CONCIERGE_FILTERS);
    setBundle(
      buildJourneyIntelligenceBundle({
        members: result.members,
        introductions
      })
    );
    setLoading(false);
  }, [introductions]);

  useEffect(() => {
    void loadIntelligence();
  }, [loadIntelligence]);

  if (loading) {
    return (
      <div className="journey-intelligence-page">
        <p className="concierge-consultant__empty">Loading journey intelligence…</p>
      </div>
    );
  }

  return (
    <div className="journey-intelligence-page">
      <header className="journey-intelligence-page__head">
        <div>
          <p className="journey-intelligence-page__eyebrow">{JOURNEY_INTELLIGENCE_BRAND}</p>
          <h2>{JOURNEY_INTELLIGENCE_NAV_LABEL}</h2>
          <p>{JOURNEY_INTELLIGENCE_TAGLINE}</p>
          <time className="journey-intelligence-page__updated" dateTime={bundle.updatedAt}>
            Updated {new Date(bundle.updatedAt).toLocaleString()}
          </time>
        </div>
        <div className="journey-intelligence-page__actions">
          <button type="button" className="concierge-consultant-btn" onClick={() => void loadIntelligence()}>
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

      <div className="journey-intelligence-page__grid">
        <JourneyMetricCard metrics={bundle.metrics} />
        <JourneyTrendCard trends={bundle.trends} />
        <ConsultantInsightsCard consultants={bundle.consultants} />
        <RegionalInsightsCard regional={bundle.regional} />
        <LegacyGrowthCard growth={bundle.legacyGrowth} />
      </div>

      <aside className="journey-intelligence-future" aria-label="Future intelligence modules">
        <p className="journey-intelligence-future__label">Future-ready</p>
        <ul>
          {JOURNEY_INTELLIGENCE_FUTURE_MODULES.map((module) => (
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
