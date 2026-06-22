import {
  ARCHIVE_PRIVACY_COPY,
  LEGACY_ARCHIVE_SUBCOPY,
  LEGACY_ARCHIVE_TITLE
} from "../../../constants/conciergeJourneyArchive";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { RelationshipStatusBadge } from "./RelationshipStatusBadge";

type LegacyArchiveCardProps = {
  member: ConciergeMemberRecord;
};

function formatYear(isoDate?: string): string | null {
  if (!isoDate) return null;
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return null;
  return String(new Date(parsed).getUTCFullYear());
}

export function LegacyArchiveCard({ member }: LegacyArchiveCardProps) {
  const archive = member.journeyArchive;
  if (!archive?.isLegacyArchive) return null;

  const formedYear = formatYear(archive.relationshipFormedAt);
  const marriedYear = formatYear(archive.marriedAt);
  const archivedYear = formatYear(archive.archivedAt);

  return (
    <section className="legacy-archive-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{LEGACY_ARCHIVE_TITLE}</h3>
        <p>{LEGACY_ARCHIVE_SUBCOPY}</p>
      </header>

      <div className="legacy-archive-card__badge-row">
        <RelationshipStatusBadge status="legacy-archive" />
        <span className="legacy-archive-card__ownership">Member belongs to BamSignal — permanently.</span>
      </div>

      <dl className="legacy-archive-card__milestones">
        <div>
          <dt>Journey ID</dt>
          <dd>{member.journeyId}</dd>
        </div>
        {formedYear ? (
          <div>
            <dt>Relationship formed</dt>
            <dd>{formedYear}</dd>
          </div>
        ) : null}
        {marriedYear ? (
          <div>
            <dt>Married</dt>
            <dd>{marriedYear}</dd>
          </div>
        ) : null}
        {archivedYear ? (
          <div>
            <dt>Archived</dt>
            <dd>{archivedYear}</dd>
          </div>
        ) : null}
      </dl>

      <p className="legacy-archive-card__privacy">{ARCHIVE_PRIVACY_COPY}</p>
    </section>
  );
}
