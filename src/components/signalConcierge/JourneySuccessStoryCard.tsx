import { MEMBER_JOURNEY_ID_LABEL, MEMBER_JOURNEY_READ_ONLY_COPY } from "../../constants/memberDashboard";
import type { MemberSuccessStorySummary } from "../../types/memberDashboard";

type JourneySuccessStoryCardProps = {
  successStory?: MemberSuccessStorySummary;
};

export function JourneySuccessStoryCard({ successStory }: JourneySuccessStoryCardProps) {
  return (
    <section className="member-dashboard-card journey-success-story-card signal-concierge-glass sc-reveal">
      <header className="member-dashboard-card__head">
        <h3>Success stories</h3>
        <p>Consent status, story categories, and publication permissions — read-only.</p>
      </header>
      {!successStory ? (
        <p className="journey-success-story-card__empty">
          Success story options appear when your journey reaches a shareable milestone with dual consent.
        </p>
      ) : (
        <>
          <p className="journey-success-story-card__journey-id">
            {MEMBER_JOURNEY_ID_LABEL}: {successStory.journeyId}
          </p>
          <dl className="journey-success-story-card__grid">
            <div>
              <dt>Consent status</dt>
              <dd>{successStory.consentStatus}</dd>
            </div>
            <div>
              <dt>Publication permission</dt>
              <dd>{successStory.publicationPermission}</dd>
            </div>
          </dl>
          <div className="journey-success-story-card__categories">
            <h4>Story categories</h4>
            <ul>
              {successStory.categories.map((category) => (
                <li key={category}>{category}</li>
              ))}
            </ul>
          </div>
          <p className="journey-success-story-card__detail">{successStory.detail}</p>
          <p className="journey-success-story-card__readonly">{MEMBER_JOURNEY_READ_ONLY_COPY}</p>
        </>
      )}
    </section>
  );
}
