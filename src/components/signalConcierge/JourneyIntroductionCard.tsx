import { MEMBER_JOURNEY_ID_LABEL } from "../../constants/memberDashboard";
import type { MemberIntroductionBuckets } from "../../types/memberDashboard";

type JourneyIntroductionCardProps = {
  introductions: MemberIntroductionBuckets;
  journeyId?: string;
};

function IntroductionBucket({
  title,
  items
}: {
  title: string;
  items: MemberIntroductionBuckets["pending"];
}) {
  if (items.length === 0) return null;
  return (
    <div className="journey-introduction-card__bucket">
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.label}</strong>
            <span>{item.detail}</span>
            <time dateTime={item.at}>{new Date(item.at).toLocaleDateString()}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function JourneyIntroductionCard({ introductions, journeyId }: JourneyIntroductionCardProps) {
  const hasAny =
    introductions.pending.length +
      introductions.accepted.length +
      introductions.declined.length +
      introductions.completed.length >
    0;

  return (
    <section className="member-dashboard-card journey-introduction-card signal-concierge-glass sc-reveal">
      <header className="member-dashboard-card__head">
        <h3>Introductions</h3>
        <p>
          Confidential introductions — always with consent.
          {journeyId ? ` ${MEMBER_JOURNEY_ID_LABEL}: ${journeyId}` : ""}
        </p>
      </header>
      {!hasAny ? (
        <p className="journey-introduction-card__empty">
          Introductions appear here when your steward presents them privately.
        </p>
      ) : (
        <div className="journey-introduction-card__buckets">
          <IntroductionBucket title="Pending" items={introductions.pending} />
          <IntroductionBucket title="Accepted" items={introductions.accepted} />
          <IntroductionBucket title="Declined" items={introductions.declined} />
          <IntroductionBucket title="Completed" items={introductions.completed} />
        </div>
      )}
      {introductions.history.length > 0 ? (
        <div className="journey-introduction-card__history">
          <h4>History</h4>
          <ul>
            {introductions.history.map((item) => (
              <li key={`history_${item.id}`}>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
                <time dateTime={item.at}>{new Date(item.at).toLocaleDateString()}</time>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
