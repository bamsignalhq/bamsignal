import { useEffect, useMemo, useState } from "react";
import {
  MEMBER_JOURNEY_DASHBOARD_BRAND,
  MEMBER_JOURNEY_DASHBOARD_TAGLINE,
  MEMBER_JOURNEY_ID_LABEL
} from "../../constants/memberDashboard";
import { navigateToPath } from "../../constants/routes";
import { SIGNAL_CONCIERGE_ROUTES } from "../../constants/signalConciergeRoutes";
import { getConciergeMember } from "../../utils/conciergeConsultantStore";
import {
  fetchConciergeMemberCase,
  formatConciergeInvoiceAmount,
  type ConciergeMemberCasePayload
} from "../../utils/conciergeMemberApi";
import { buildMemberJourneyDashboardBundle } from "../../utils/memberDashboardEngine";
import {
  hydrateSignalConciergeApplicationFromServer,
  readSignalConciergeApplication
} from "../../utils/signalConciergeStorage";
import type { SignalConciergeApplication } from "../../types/signalConcierge";
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
  const [application, setApplication] = useState<SignalConciergeApplication | null>(() =>
    readSignalConciergeApplication()
  );
  const [opsCase, setOpsCase] = useState<ConciergeMemberCasePayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    void hydrateSignalConciergeApplicationFromServer().then((next) => {
      if (!cancelled) setApplication(next);
    });
    void fetchConciergeMemberCase().then((next) => {
      if (!cancelled && next.ok) setOpsCase(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const journeyId = bundle.overview.journeyId || opsCase?.case?.journeyId || undefined;
  const consultantFromOps = opsCase?.case?.consultantId
    ? {
        ...bundle.consultantDetail,
        name: bundle.consultantDetail.name || opsCase.case.consultantId,
        messageSummary:
          bundle.consultantDetail.messageSummary ||
          `Assigned ${
            opsCase.case.assignedAt ? new Date(opsCase.case.assignedAt).toLocaleDateString() : "recently"
          }. Contact schedule and updates appear on your case timeline.`
      }
    : bundle.consultantDetail;

  const openInvoice = (opsCase?.invoices || []).find((row) =>
    ["issued", "open", "pending"].includes(String(row.status || "").toLowerCase())
  );
  const nextMilestone = bundle.upcoming?.[0];
  const nextStep = openInvoice
    ? {
        title: "Settle your open invoice",
        detail: `${openInvoice.notes || openInvoice.invoice_number || "Concierge invoice"} · ${formatConciergeInvoiceAmount(
          openInvoice.total_kobo || 0
        )}`,
        cta: "Pay invoice",
        href: SIGNAL_CONCIERGE_ROUTES.invoices
      }
    : nextMilestone
      ? {
          title: nextMilestone.label || "Upcoming milestone",
          detail:
            nextMilestone.detail ||
            (nextMilestone.scheduledAt
              ? `Scheduled ${new Date(nextMilestone.scheduledAt).toLocaleString()}`
              : "Your consultant will confirm timing."),
          cta: "View journey",
          href: null as string | null
        }
      : opsCase?.case?.opsStatus === "awaiting_payment"
        ? {
            title: "Payment confirmation in progress",
            detail: "Once your invoice clears, your consultant will unlock the next introduction step.",
            cta: "View invoices",
            href: SIGNAL_CONCIERGE_ROUTES.invoices
          }
        : {
            title: "Stay available for your consultant",
            detail:
              "Your private case is active. Keep preferences current and respond promptly to introduction prep.",
            cta: "Schedule consultation",
            href: SIGNAL_CONCIERGE_ROUTES.consultation
          };

  const opsTimeline = (opsCase?.history || []).slice(0, 8).map((event) => ({
    id: event.id,
    title: event.eventType?.replace(/_/g, " ") || "Case update",
    detail: event.notes || "",
    at: event.createdAt || null
  }));

  return (
    <div className="member-journey-dashboard sc-reveal">
      <header className="member-journey-dashboard__head signal-concierge-glass">
        <p className="member-journey-dashboard__eyebrow">{MEMBER_JOURNEY_DASHBOARD_BRAND}</p>
        <h2>Your private client portal</h2>
        <p>{MEMBER_JOURNEY_DASHBOARD_TAGLINE}</p>
        {journeyId ? (
          <p className="member-journey-dashboard__journey-id">
            {MEMBER_JOURNEY_ID_LABEL}: <strong>{journeyId}</strong>
          </p>
        ) : null}
        {opsCase?.case?.opsStatus ? (
          <p className="member-journey-dashboard__journey-id">
            Case status: <strong>{opsCase.case.opsStatus.replace(/_/g, " ")}</strong>
          </p>
        ) : null}
      </header>

      <section className="signal-concierge-glass member-journey-dashboard__next-step" aria-label="Next step">
        <p className="member-journey-dashboard__eyebrow">Next step</p>
        <h3>{nextStep.title}</h3>
        <p>{nextStep.detail}</p>
        <div className="signal-concierge-hero__actions" style={{ marginTop: "0.75rem" }}>
          {nextStep.href ? (
            <button
              type="button"
              className="signal-concierge-btn signal-concierge-btn--primary"
              onClick={() => navigateToPath(nextStep.href!)}
            >
              {nextStep.cta}
            </button>
          ) : null}
          <button
            type="button"
            className="signal-concierge-btn signal-concierge-btn--ghost"
            onClick={() => navigateToPath(SIGNAL_CONCIERGE_ROUTES.invoices)}
          >
            Invoice history
            {opsCase?.payments?.openCount
              ? ` (${opsCase.payments.openCount} open · ${formatConciergeInvoiceAmount(
                  opsCase.payments.outstandingKobo
                )})`
              : ""}
          </button>
        </div>
      </section>

      <div className="member-journey-dashboard__grid">
        <JourneyOverviewCard overview={bundle.overview} />
        <JourneyUpcomingCard items={bundle.upcoming} journeyId={journeyId} />
        <JourneyTimelineCard timeline={bundle.timeline} journeyId={journeyId} />
        {opsTimeline.length > 0 ? (
          <section className="signal-concierge-glass journey-timeline-card">
            <header className="journey-timeline-card__head">
              <h3>Case timeline</h3>
              <p>Verified updates from your Concierge operations case.</p>
            </header>
            <ol className="journey-timeline-card__list">
              {opsTimeline.map((event) => (
                <li key={event.id}>
                  <strong>{event.title}</strong>
                  {event.detail ? <p>{event.detail}</p> : null}
                  {event.at ? (
                    <time dateTime={event.at}>{new Date(event.at).toLocaleString()}</time>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}
        <JourneyConsultantCard consultant={consultantFromOps} />
        <JourneyIntroductionCard introductions={bundle.introductionsDetail} journeyId={journeyId} />
        <JourneyMilestoneCard journey={bundle.relationshipJourney} journeyId={journeyId} />
        <JourneySuccessStoryCard successStory={bundle.successStory} />
      </div>
    </div>
  );
}
