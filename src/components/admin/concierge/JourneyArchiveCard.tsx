import {
  ARCHIVE_PRIVACY_COPY,
  JOURNEY_ARCHIVE_SUBCOPY,
  JOURNEY_ARCHIVE_TITLE
} from "../../../constants/conciergeJourneyArchive";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { RelationshipStatusBadge } from "./RelationshipStatusBadge";

type JourneyArchiveCardProps = {
  member: ConciergeMemberRecord;
  onSelect?: (memberId: string) => void;
  selected?: boolean;
};

export function JourneyArchiveCard({ member, onSelect, selected = false }: JourneyArchiveCardProps) {
  const archive = member.journeyArchive;
  if (!archive) return null;

  const content = (
    <>
      <header className="journey-archive-card__head">
        <div>
          <strong>{member.aboutYou.name}</strong>
          <span>{member.journeyId}</span>
        </div>
        <RelationshipStatusBadge status={archive.relationshipStatus} />
      </header>
      <div className="journey-archive-card__meta">
        <span>{member.aboutYou.city}</span>
        {member.preferredTier ? <span>{member.preferredTier}</span> : null}
        {member.assignedConsultantName ? <span>{member.assignedConsultantName}</span> : null}
      </div>
      {archive.marriedAt ? (
        <p className="journey-archive-card__married">
          Married {new Date(archive.marriedAt).getFullYear()}
        </p>
      ) : null}
      {archive.archivedAt ? (
        <p className="journey-archive-card__archived">
          Archived {new Date(archive.archivedAt).toLocaleDateString()}
        </p>
      ) : null}
      <p className="journey-archive-card__privacy">{ARCHIVE_PRIVACY_COPY}</p>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={`journey-archive-card concierge-consultant-card--glass cc-reveal${
          selected ? " journey-archive-card--selected" : ""
        }`}
        onClick={() => onSelect(member.id)}
      >
        {content}
      </button>
    );
  }

  return (
    <section className="journey-archive-card concierge-consultant-card--glass cc-reveal">
      {content}
    </section>
  );
}

export function JourneyArchiveCardHeader() {
  return (
    <header className="journey-archive-page__intro">
      <h3>{JOURNEY_ARCHIVE_TITLE}</h3>
      <p>{JOURNEY_ARCHIVE_SUBCOPY}</p>
    </header>
  );
}
