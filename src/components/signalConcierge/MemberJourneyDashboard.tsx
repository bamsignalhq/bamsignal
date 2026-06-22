import { useMemo } from "react";
import {
  MEMBER_JOURNEY_DASHBOARD_BRAND,
  MEMBER_JOURNEY_DASHBOARD_TAGLINE,
  MEMBER_JOURNEY_ID_LABEL
} from "../../constants/memberDashboard";
import { getConciergeMember } from "../../utils/conciergeConsultantStore";
import { buildMemberJourneyDashboardBundle } from "../../utils/memberDashboardEngine";
import { readSignalConciergeApplication } from "../../utils/signalConciergeStorage";
import { JourneyConsultantCard } from "./JourneyConsultantCard";
import { JourneyIntroductionCard } from "./JourneyIntroductionCard";
import { JourneyMilestoneCard } from "./JourneyMilestoneCard";
import { JourneyOverviewCard } from "./JourneyOverviewCard";
import { JourneySuccessStoryCard } from "./JourneySuccessStoryCard";
import { JourneyTimelineCard } from "./JourneyTimelineCard";
import { JourneyUpcomingCard } from "./JourneyUpcomingCard";

type MemberJourneyDashboardProps = {
  onApply: () => void;
  onScheduleConsultation: () => void;
};

export function MemberJourneyDashboard({ onApply, onScheduleConsultation }: MemberJourneyDashboardProps) {
  const application = readSignalConciergeApplication();

  const bundle = useMemo(() => {
    if (!application) return null;
    const member = getConciergeMember(application.id);
    return buildMemberJourneyDashboardBundle(application, member);
  }, [application]);

  if (!application || !bundle) {
    return (
      <section className="member-journey-dashboard signal-concierge-glass sc-reveal">
        <header className="member-journey-dashboard__head">
          <h2>{MEMBER_JOURNEY_DASHBOARD_BRAND}</h2>
          <p>Begin your private Signal Concierge journey to unlock your dashboard.</p>
        </header>
        <div className="signal-concierge-hero__actions">
          <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={onApply}>
            Begin application
          </button>
          <button
            type="button"
            className="signal-concierge-btn signal-concierge-btn--ghost"
            onClick={onScheduleConsultation}
          >
            Schedule consultation
          </button>
        </div>
      </section>
    );
  }

  const journeyId = bundle.overview.journeyId;

  return (
    <div className="member-journey-dashboard sc-reveal">
      <header className="member-journey-dashboard__head signal-concierge-glass">
        <p className="member-journey-dashboard__eyebrow">{MEMBER_JOURNEY_DASHBOARD_BRAND}</p>
        <h2>Your concierge journey</h2>
        <p>{MEMBER_JOURNEY_DASHBOARD_TAGLINE}</p>
        {journeyId ? (
          <p className="member-journey-dashboard__journey-id">
            {MEMBER_JOURNEY_ID_LABEL}: <strong>{journeyId}</strong>
          </p>
        ) : null}
      </header>

      <div className="member-journey-dashboard__grid">
        <JourneyOverviewCard overview={bundle.overview} />
        <JourneyUpcomingCard items={bundle.upcoming} journeyId={journeyId} />
        <JourneyTimelineCard timeline={bundle.timeline} journeyId={journeyId} />
        <JourneyConsultantCard consultant={bundle.consultantDetail} />
        <JourneyIntroductionCard introductions={bundle.introductionsDetail} journeyId={journeyId} />
        <JourneyMilestoneCard journey={bundle.relationshipJourney} journeyId={journeyId} />
        <JourneySuccessStoryCard successStory={bundle.successStory} />
      </div>
    </div>
  );
}
