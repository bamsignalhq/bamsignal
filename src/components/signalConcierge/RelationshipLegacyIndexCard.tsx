import {
  CELEBRATING_YOUR_JOURNEY,
  LEGACY_INDEX_SUBCOPY,
  LEGACY_STATUS_LABEL,
  RELATIONSHIP_LEGACY_INDEX_TITLE
} from "../../constants/relationshipLegacyIndex";
import type { LegacyProfileViewModel } from "../../utils/relationshipLegacyIndexLogic";
import { LegacyMilestoneCard } from "./LegacyMilestoneCard";
import { LegacyStatusBadge } from "./LegacyStatusBadge";
import { LegacyStoryCategoryCard } from "./LegacyStoryCategoryCard";
import { LegacyTimelineCard } from "./LegacyTimelineCard";
import { LegacyFamilyCard } from "./LegacyFamilyCard";

type RelationshipLegacyIndexCardProps = {
  profile: LegacyProfileViewModel;
  celebrate?: boolean;
  onRecordLegacyFamily?: (input: { childrenCount: number; currentCountry: string }) => void;
};

function LegacyDateRow({ label, year }: { label: string; year?: string }) {
  if (!year) return null;
  return (
    <div className="relationship-legacy-index-card__date-row">
      <span className="relationship-legacy-index-card__date-label">{label}</span>
      <span className="relationship-legacy-index-card__date-year">{year}</span>
    </div>
  );
}

export function RelationshipLegacyIndexCard({
  profile,
  celebrate = false,
  onRecordLegacyFamily
}: RelationshipLegacyIndexCardProps) {
  return (
    <section
      className={`relationship-legacy-index-card concierge-consultant-card concierge-consultant-card--glass cc-reveal${
        celebrate ? " relationship-legacy-index-card--celebrate" : ""
      }`}
    >
      <header className="relationship-legacy-index-card__head">
        <p className="relationship-legacy-index-card__eyebrow">{RELATIONSHIP_LEGACY_INDEX_TITLE}</p>
        <h3>{celebrate ? CELEBRATING_YOUR_JOURNEY : "Legacy Profile"}</h3>
        <p className="relationship-legacy-index-card__lede">
          {celebrate
            ? "Your relationship journey — preserved forever in the Relationship Legacy Index™."
            : LEGACY_INDEX_SUBCOPY}
        </p>
      </header>

      <div className="relationship-legacy-index-card__journey-id">
        <span>Journey ID</span>
        <strong>{profile.journeyId}</strong>
      </div>

      <div className="relationship-legacy-index-card__dates">
        <LegacyDateRow label="Met" year={profile.metYear} />
        {!profile.legacyFamily ? <LegacyDateRow label="Engaged" year={profile.engagedYear} /> : null}
        <LegacyDateRow label="Married" year={profile.marriedYear} />
      </div>

      {profile.legacyFamily ? (
        <LegacyFamilyCard
          family={profile.legacyFamily}
          readOnly={celebrate || !onRecordLegacyFamily}
          onRecord={onRecordLegacyFamily}
        />
      ) : null}

      <div className="relationship-legacy-index-card__grid">
        <LegacyStoryCategoryCard categories={profile.storyCategories} celebrate={celebrate} />
        <LegacyMilestoneCard milestones={profile.anniversaryMilestones} celebrate={celebrate} />
      </div>

      <div className="relationship-legacy-index-card__status-row">
        <span className="relationship-legacy-index-card__status-label">{LEGACY_STATUS_LABEL}</span>
        <LegacyStatusBadge status={profile.legacyStatus} />
      </div>

      <LegacyTimelineCard phases={profile.timelinePhases} celebrate={celebrate} />

      {!celebrate ? (
        <dl className="relationship-legacy-index-card__meta">
          <div>
            <dt>Member</dt>
            <dd>{profile.memberName}</dd>
          </div>
          <div>
            <dt>City</dt>
            <dd>{profile.city}</dd>
          </div>
          <div>
            <dt>Country</dt>
            <dd>{profile.country}</dd>
          </div>
          {profile.consultantName ? (
            <div>
              <dt>Consultant</dt>
              <dd>{profile.consultantName}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </section>
  );
}
