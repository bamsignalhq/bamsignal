import { JOURNEY_INTELLIGENCE_BRAND } from "../constants/journeyIntelligence";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { IntroductionRecord } from "../types/conciergeIntroduction";
import type { JourneyIntelligenceBundle } from "../types/journeyIntelligence";
import { buildJourneyAnalyticsBundle } from "./journeyAnalyticsLogic";
import {
  buildConsultantInsights,
  buildJourneyIntelligenceMetrics,
  buildLegacyGrowthSignals,
  buildRegionalInsights
} from "./journeyIntelligenceLogic";
import { listConciergeMembers } from "./conciergeConsultantStore";
import { listIntroductionRecords } from "./conciergeIntroductionStore";
import { buildRegionalConsultantTeamsBundle } from "./regionalConsultantEngine";

export { JOURNEY_INTELLIGENCE_BRAND };

export function buildJourneyIntelligenceBundle(input?: {
  members?: ConciergeMemberRecord[];
  introductions?: IntroductionRecord[];
}): JourneyIntelligenceBundle {
  const members = input?.members ?? listConciergeMembers();
  const introductions = input?.introductions ?? listIntroductionRecords();
  const analytics = buildJourneyAnalyticsBundle({ members, introductions });

  return {
    metrics: buildJourneyIntelligenceMetrics(members, introductions),
    consultants: buildConsultantInsights(members),
    regional: buildRegionalInsights(members),
    regionalTeams: buildRegionalConsultantTeamsBundle({ members }),
    trends: analytics.trends,
    legacyGrowth: buildLegacyGrowthSignals(members),
    updatedAt: new Date().toISOString()
  };
}

export function getJourneyIntelligenceSnapshot(): JourneyIntelligenceBundle {
  return buildJourneyIntelligenceBundle();
}
