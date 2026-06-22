import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EMPTY_JOURNEY_ARCHIVE_FILTERS,
  JOURNEY_ARCHIVE_TITLE,
  JOURNEY_HISTORY_LABEL,
  RELATIONSHIP_JOURNEY_STATUS_LABELS,
  type JourneyArchiveFilters
} from "../../../constants/conciergeJourneyArchive";
import { SIGNAL_CONCIERGE_TIERS } from "../../../constants/signalConcierge";
import {
  fetchAdminConciergeArchiveMembers,
  fetchAdminConciergeMember
} from "../../../services/adminConcierge";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { ArchiveTimeline } from "./ArchiveTimeline";
import { JourneyArchiveCard, JourneyArchiveCardHeader } from "./JourneyArchiveCard";
import { LegacyArchiveCard } from "./LegacyArchiveCard";
import { JourneyHistoryCard } from "./JourneyHistoryCard";
import { AnniversaryTimelineCard } from "../../signalConcierge/AnniversaryTimelineCard";
import { ensureJourneyMilestoneTimeline } from "../../../utils/journeyMilestoneStore";
import { RelationshipLegacyIndexCard } from "../../signalConcierge/RelationshipLegacyIndexCard";
import { buildLegacyProfileForMember } from "../../../utils/relationshipLegacyIndexProfile";

export function JourneyArchivePage() {
  const [filters, setFilters] = useState<JourneyArchiveFilters>(EMPTY_JOURNEY_ARCHIVE_FILTERS);
  const [members, setMembers] = useState<ConciergeMemberRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<ConciergeMemberRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    const result = await fetchAdminConciergeArchiveMembers(filters);
    setMembers(result.members);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedMember(null);
      return;
    }
    void fetchAdminConciergeMember(selectedId).then((result) => {
      setSelectedMember(result.member);
    });
  }, [selectedId]);

  const legacyCount = useMemo(
    () => members.filter((member) => member.journeyArchive?.isLegacyArchive).length,
    [members]
  );

  const patchFilters = (partial: Partial<JourneyArchiveFilters>) =>
    setFilters((current) => ({ ...current, ...partial }));

  return (
    <div className="journey-archive-page">
      <header className="journey-archive-page__head">
        <div>
          <h2>{JOURNEY_ARCHIVE_TITLE}</h2>
          <p>
            {members.length} preserved journeys · {legacyCount} legacy archives. Cases are never
            deleted.
          </p>
        </div>
      </header>

      <section className="journey-archive-page__search concierge-search-bar concierge-consultant-card--glass">
        <label>
          Search
          <input
            value={filters.query}
            onChange={(event) => patchFilters({ query: event.target.value })}
            placeholder="Journey ID, name, city, consultant"
          />
        </label>
        <label>
          Archive status
          <select
            value={filters.archiveStatus}
            onChange={(event) =>
              patchFilters({
                archiveStatus: event.target.value as JourneyArchiveFilters["archiveStatus"]
              })
            }
          >
            <option value="all">All archive statuses</option>
            {Object.entries(RELATIONSHIP_JOURNEY_STATUS_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Marriage year
          <input
            inputMode="numeric"
            value={filters.marriageYear}
            onChange={(event) => patchFilters({ marriageYear: event.target.value })}
            placeholder="e.g. 2030"
          />
        </label>
        <label>
          Consultant
          <input
            value={filters.consultant}
            onChange={(event) => patchFilters({ consultant: event.target.value })}
          />
        </label>
        <label>
          City
          <input value={filters.city} onChange={(event) => patchFilters({ city: event.target.value })} />
        </label>
        <label>
          Tier
          <select
            value={filters.tier}
            onChange={(event) => patchFilters({ tier: event.target.value as JourneyArchiveFilters["tier"] })}
          >
            <option value="all">All tiers</option>
            {SIGNAL_CONCIERGE_TIERS.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.landingName}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="journey-archive-page__body">
        <aside className="journey-archive-page__list">
          <JourneyArchiveCardHeader />
          {loading ? <p className="concierge-consultant__empty">Loading archive…</p> : null}
          {!loading && members.length === 0 ? (
            <p className="concierge-consultant__empty">No archived journeys match these filters.</p>
          ) : null}
          <div className="journey-archive-page__cards">
            {members.map((member) => (
              <JourneyArchiveCard
                key={member.id}
                member={member}
                selected={selectedId === member.id}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        </aside>

        <div className="journey-archive-page__detail">
          {selectedMember ? (
            <>
              {(() => {
                const legacyProfile = buildLegacyProfileForMember(selectedMember);
                return legacyProfile ? (
                  <RelationshipLegacyIndexCard profile={legacyProfile} />
                ) : null;
              })()}
              <LegacyArchiveCard member={selectedMember} />
              {selectedMember.journeyId ? (
                <AnniversaryTimelineCard
                  timeline={
                    selectedMember.journeyMilestoneTimeline ??
                    ensureJourneyMilestoneTimeline(selectedMember.journeyId)
                  }
                  recordedBy="BamSignal Admin"
                />
              ) : null}
              <section className="concierge-consultant-card concierge-consultant-card--glass cc-reveal">
                <header className="concierge-consultant-card__head">
                  <h3>{JOURNEY_HISTORY_LABEL}</h3>
                  <p>Full relationship journey — notes, introductions, and meetings preserved.</p>
                </header>
                <ArchiveTimeline events={selectedMember.timeline} />
              </section>
              <JourneyHistoryCard member={selectedMember} />
            </>
          ) : (
            <div className="concierge-consultant-card concierge-consultant-card--glass journey-archive-page__placeholder cc-reveal">
              <h3>Select a relationship journey</h3>
              <p>Review preserved history, legacy archives, and timeline events.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
