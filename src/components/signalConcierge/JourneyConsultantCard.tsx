import { MEMBER_JOURNEY_ID_LABEL } from "../../constants/memberDashboard";
import type { MemberConsultantDetail } from "../../types/memberDashboard";

type JourneyConsultantCardProps = {
  consultant: MemberConsultantDetail;
};

export function JourneyConsultantCard({ consultant }: JourneyConsultantCardProps) {
  return (
    <section className="member-dashboard-card journey-consultant-card signal-concierge-glass sc-reveal">
      <header className="member-dashboard-card__head">
        <h3>Consultant</h3>
        <p>
          Your assigned steward — operational owner of your concierge journey.
          {consultant.journeyId ? ` ${MEMBER_JOURNEY_ID_LABEL}: ${consultant.journeyId}` : ""}
        </p>
      </header>
      {consultant.name ? (
        <p className="journey-consultant-card__name">{consultant.name}</p>
      ) : (
        <p className="journey-consultant-card__pending">Awaiting steward assignment</p>
      )}
      <dl className="journey-consultant-card__grid">
        <div>
          <dt>Role</dt>
          <dd>{consultant.role}</dd>
        </div>
        <div>
          <dt>Availability</dt>
          <dd>{consultant.availability}</dd>
        </div>
      </dl>
      <p className="journey-consultant-card__summary">{consultant.messageSummary}</p>
      {consultant.upcomingMeetingAt ? (
        <div className="journey-consultant-card__meeting">
          <strong>{consultant.upcomingMeetingLabel ?? "Upcoming meeting"}</strong>
          <time dateTime={consultant.upcomingMeetingAt}>
            {new Date(consultant.upcomingMeetingAt).toLocaleString()}
          </time>
        </div>
      ) : null}
    </section>
  );
}
