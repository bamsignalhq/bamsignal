import { useCallback, useEffect, useMemo, useState } from "react";
import {
  JOURNEY_ANALYTICS_BRAND,
  JOURNEY_ANALYTICS_FUTURE_MODULES,
  JOURNEY_ANALYTICS_TAGLINE
} from "../../../constants/journeyAnalytics";
import { EMPTY_CONCIERGE_FILTERS } from "../../../types/conciergeConsultant";
import { fetchAdminConciergeMembers } from "../../../services/adminConcierge";
import type { JourneyAnalyticsBundle } from "../../../types/journeyAnalytics";
import { listIntroductionRecords } from "../../../utils/conciergeIntroductionStore";
import { buildJourneyAnalyticsBundle } from "../../../utils/journeyAnalyticsLogic";
import { JourneyGrowthCard } from "./JourneyGrowthCard";
import { JourneyMetricsCard } from "./JourneyMetricsCard";
import { JourneyOutcomeCard } from "./JourneyOutcomeCard";
import { JourneyTrendCard } from "./JourneyTrendCard";

function emptyBundle(): JourneyAnalyticsBundle {
  return buildJourneyAnalyticsBundle({ members: [], introductions: [] });
}

export function JourneyAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [bundle, setBundle] = useState<JourneyAnalyticsBundle>(emptyBundle);
  const introductions = useMemo(() => listIntroductionRecords(), []);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    const result = await fetchAdminConciergeMembers(EMPTY_CONCIERGE_FILTERS);
    setBundle(
      buildJourneyAnalyticsBundle({
        members: result.members,
        introductions
      })
    );
    setLoading(false);
  }, [introductions]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="journey-analytics-page">
        <p className="concierge-consultant__empty">Loading journey intelligence…</p>
      </div>
    );
  }

  return (
    <div className="journey-analytics-page">
      <header className="journey-analytics-page__head">
        <p className="journey-analytics-page__eyebrow">{JOURNEY_ANALYTICS_BRAND}</p>
        <h2>Relationship Intelligence</h2>
        <p>{JOURNEY_ANALYTICS_TAGLINE}</p>
        <time className="journey-analytics-page__updated" dateTime={bundle.updatedAt}>
          Updated {new Date(bundle.updatedAt).toLocaleString()}
        </time>
      </header>

      <div className="journey-analytics-page__grid">
        <JourneyMetricsCard metrics={bundle.metrics} />
        <JourneyTrendCard trends={bundle.trends} />
        <JourneyOutcomeCard outcomes={bundle.outcomes} />
        <JourneyGrowthCard growth={bundle.growth} />
      </div>

      <aside className="journey-analytics-future" aria-label="Future analytics modules">
        <p className="journey-analytics-future__label">Future-ready</p>
        <ul>
          {JOURNEY_ANALYTICS_FUTURE_MODULES.map((module) => (
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
