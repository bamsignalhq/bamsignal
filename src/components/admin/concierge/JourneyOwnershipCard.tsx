import {
  JOURNEY_MEMBER_TRUST_COPY,
  JOURNEY_OWNERSHIP_HEADLINE,
  JOURNEY_OWNERSHIP_SUBCOPY,
  JOURNEY_OWNERSHIP_TITLE
} from "../../../constants/conciergeJourneyContinuity";
import { CONCIERGE_MEMBER_OWNERSHIP } from "../../../constants/conciergeMemberOwnership";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { getMemberStewardName } from "../../../utils/conciergeMemberStewardship";

type JourneyOwnershipCardProps = {
  member: ConciergeMemberRecord;
};

export function JourneyOwnershipCard({ member }: JourneyOwnershipCardProps) {
  const stewardName = getMemberStewardName(member);

  return (
    <section className="journey-ownership-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{JOURNEY_OWNERSHIP_TITLE}</h3>
        <p>{JOURNEY_OWNERSHIP_SUBCOPY}</p>
      </header>
      <div className="journey-ownership-card__badge">
        <span>Ownership</span>
        <strong>BamSignal</strong>
      </div>
      <p className="journey-ownership-card__headline">{JOURNEY_OWNERSHIP_HEADLINE}</p>
      <div className="journey-ownership-card__fields">
        <div>
          <span>Current steward</span>
          <strong>{stewardName ?? "Awaiting steward assignment"}</strong>
        </div>
        {member.assignedAt ? (
          <div>
            <span>Journey since</span>
            <time dateTime={member.assignedAt}>{new Date(member.assignedAt).toLocaleDateString()}</time>
          </div>
        ) : null}
      </div>
      <p className="journey-ownership-card__trust">{JOURNEY_MEMBER_TRUST_COPY}</p>
      <p className="journey-ownership-card__policy">
        {member.ownership === CONCIERGE_MEMBER_OWNERSHIP
          ? "Member belongs to BamSignal — always."
          : null}
      </p>
    </section>
  );
}
