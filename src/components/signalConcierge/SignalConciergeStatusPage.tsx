import { useEffect, useMemo, useState } from "react";
import { MEMBER_DASHBOARD_BRAND, MEMBER_JOURNEY_DASHBOARD_PATH } from "../../constants/memberDashboard";
import { navigateToPath } from "../../constants/routes";
import { getConciergeMember } from "../../utils/conciergeConsultantStore";
import { buildMemberDashboardBundle } from "../../utils/memberDashboardLogic";
import {
  hydrateSignalConciergeApplicationFromServer,
  readSignalConciergeApplication
} from "../../utils/signalConciergeStorage";
import type { SignalConciergeApplication } from "../../types/signalConcierge";
import { AssignedConsultantCard } from "./AssignedConsultantCard";
import { IntroductionSummaryCard } from "./IntroductionSummaryCard";
import { JourneyHeader } from "./JourneyHeader";
import { JourneyOverviewCard } from "./JourneyOverviewCard";
import { MemberNotificationCard } from "./MemberNotificationCard";
import { MemberTimelineCard } from "./MemberTimelineCard";
import { RelationshipMilestoneSummaryCard } from "./RelationshipMilestoneSummaryCard";
import { UpcomingMeetingCard } from "./UpcomingMeetingCard";

type SignalConciergeStatusPageProps = {
  onApply: () => void;
  onScheduleConsultation: () => void;
};

export function SignalConciergeStatusPage({
  onApply,
  onScheduleConsultation
}: SignalConciergeStatusPageProps) {
  const [application, setApplication] = useState<SignalConciergeApplication | null>(() =>
    readSignalConciergeApplication()
  );

  useEffect(() => {
    let cancelled = false;
    void hydrateSignalConciergeApplicationFromServer().then((next) => {
      if (!cancelled) setApplication(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const bundle = useMemo(() => {
    if (!application) return null;
    const member = getConciergeMember(application.id);
    return buildMemberDashboardBundle(application, member);
  }, [application]);

  if (!application || !bundle) {
    return (
      <section className="signal-concierge-status signal-concierge-glass sc-reveal">
        <JourneyHeader
          title="Your journey"
          subtitle="Begin your private Signal Concierge journey."
        />
        <p className="signal-concierge-section__sub">
          You have not started a Signal Concierge application yet.
        </p>
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

  return (
    <div className="member-dashboard sc-reveal">
      <JourneyHeader
        journeyId={bundle.overview.journeyId}
        title="Your journey"
        subtitle={`${MEMBER_DASHBOARD_BRAND} — private, warm, and journey-centered.`}
        className="member-dashboard__header signal-concierge-glass"
      />

      <div className="member-dashboard__grid">
        <JourneyOverviewCard overview={bundle.overview} />
        <AssignedConsultantCard consultant={bundle.consultant} />
        <UpcomingMeetingCard meeting={bundle.upcomingMeeting} />

        {bundle.recentMeetings.length > 0 ? (
          <section className="member-dashboard-card recent-meetings-card signal-concierge-glass sc-reveal">
            <header className="member-dashboard-card__head">
              <h3>Recent meetings</h3>
              <p>Private conversations with your steward.</p>
            </header>
            <ul className="recent-meetings-card__list">
              {bundle.recentMeetings.map((meeting) => (
                <li key={meeting.id}>
                  <strong>{meeting.label}</strong>
                  <span>{meeting.detail}</span>
                  <time dateTime={meeting.at}>{new Date(meeting.at).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <IntroductionSummaryCard introductions={bundle.introductions} />
        <RelationshipMilestoneSummaryCard milestones={bundle.milestones} />
        <MemberNotificationCard notifications={bundle.notifications} />
        <MemberTimelineCard timeline={bundle.timeline} />
      </div>

      <div className="member-dashboard__actions signal-concierge-hero__actions">
        <button
          type="button"
          className="signal-concierge-btn signal-concierge-btn--primary"
          onClick={() => navigateToPath(MEMBER_JOURNEY_DASHBOARD_PATH)}
        >
          Open journey dashboard
        </button>
        <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={onApply}>
          Update application
        </button>
        <button
          type="button"
          className="signal-concierge-btn signal-concierge-btn--primary"
          onClick={onScheduleConsultation}
        >
          Schedule consultation
        </button>
      </div>
    </div>
  );
}
