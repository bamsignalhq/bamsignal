import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RELATIONSHIP_LEGACY_EXPERIENCE_SUBCOPY,
  RELATIONSHIP_LEGACY_EXPERIENCE_TITLE
} from "../../../constants/relationshipLegacyExperience";
import {
  EMPTY_LEGACY_INDEX_FILTERS,
  LEGACY_STATUS_DEFINITIONS,
  type LegacyIndexFilters
} from "../../../constants/relationshipLegacyIndex";
import { JOURNEY_STORY_CATEGORIES } from "../../../constants/journeyStoryCategories";
import {
  fetchAdminConciergeMember,
  fetchAdminConciergeLegacyIndexMembers
} from "../../../services/adminConcierge";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { buildLegacyProfileForMember } from "../../../utils/relationshipLegacyIndexProfile";
import { recordRelationshipLegacyFamily } from "../../../utils/relationshipLegacyIndexStore";
import { getRelationshipLegacyQuotesArchitectureTimeline } from "../../../utils/RelationshipLegacyQuotesEngine";
import { ensureJourneyMilestoneTimeline } from "../../../utils/journeyMilestoneStore";
import { LegacyFamilyCard } from "./LegacyFamilyCard";
import { LegacyMilestoneCard } from "./LegacyMilestoneCard";
import { LegacyStatusCard } from "./LegacyStatusCard";
import { LegacyTimelinePage } from "./LegacyTimelinePage";
import { LegacyStatusBadge } from "../../signalConcierge/LegacyStatusBadge";

export function LegacyExperiencePage() {
  const [filters, setFilters] = useState<LegacyIndexFilters>(EMPTY_LEGACY_INDEX_FILTERS);
  const [members, setMembers] = useState<ConciergeMemberRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<ConciergeMemberRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    const result = await fetchAdminConciergeLegacyIndexMembers(filters);
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

  const profile = useMemo(
    () => (selectedMember ? buildLegacyProfileForMember(selectedMember) : null),
    [selectedMember]
  );

  const milestones = useMemo(() => {
    if (!selectedMember?.journeyId) return [];
    return (
      selectedMember.journeyMilestoneTimeline?.milestones ??
      ensureJourneyMilestoneTimeline(selectedMember.journeyId).milestones
    );
  }, [selectedMember]);

  const quotes = useMemo(() => {
    if (!profile) return [];
    return getRelationshipLegacyQuotesArchitectureTimeline().filter(
      (quote) => quote.journeyId === profile.journeyId
    );
  }, [profile]);

  const patchFilters = (partial: Partial<LegacyIndexFilters>) =>
    setFilters((current) => ({ ...current, ...partial }));

  const handleRecordLegacyFamily = (input: { childrenCount: number; currentCountry: string }) => {
    if (!selectedMember?.journeyId) return;
    recordRelationshipLegacyFamily(selectedMember.journeyId, {
      ...input,
      recordedBy: "BamSignal Admin"
    });
    void fetchAdminConciergeMember(selectedMember.id).then((result) => {
      setSelectedMember(result.member);
    });
    void loadMembers();
  };

  return (
    <div className="legacy-experience-page">
      <header className="legacy-experience-page__head">
        <h2>{RELATIONSHIP_LEGACY_EXPERIENCE_TITLE}</h2>
        <p>{RELATIONSHIP_LEGACY_EXPERIENCE_SUBCOPY}</p>
      </header>

      <section className="legacy-experience-page__search concierge-search-bar concierge-consultant-card--glass">
        <label>
          Journey ID
          <input
            value={filters.query}
            onChange={(event) => patchFilters({ query: event.target.value })}
            placeholder="BS-JR-2028-0045"
          />
        </label>
        <label>
          Legacy status
          <select
            value={filters.legacyStatus}
            onChange={(event) =>
              patchFilters({
                legacyStatus: event.target.value as LegacyIndexFilters["legacyStatus"]
              })
            }
          >
            <option value="all">All statuses</option>
            {LEGACY_STATUS_DEFINITIONS.map((status) => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Story category
          <select
            value={filters.storyCategory}
            onChange={(event) =>
              patchFilters({
                storyCategory: event.target.value as LegacyIndexFilters["storyCategory"]
              })
            }
          >
            <option value="all">All categories</option>
            {JOURNEY_STORY_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="legacy-experience-page__body">
        <aside className="legacy-experience-page__list concierge-consultant-card--glass">
          <h3>Legacy journeys</h3>
          {loading ? <p className="concierge-consultant__empty">Loading…</p> : null}
          {!loading && !members.length ? (
            <p className="concierge-consultant__empty">No legacy journeys match your filters.</p>
          ) : null}
          <ul>
            {members.map((member) => {
              const memberProfile = buildLegacyProfileForMember(member);
              if (!memberProfile) return null;
              return (
                <li key={member.id}>
                  <button
                    type="button"
                    className={`legacy-experience-page__row${
                      selectedId === member.id ? " is-active" : ""
                    }`}
                    onClick={() => setSelectedId(member.id)}
                  >
                    <strong>{memberProfile.memberName}</strong>
                    <span>{memberProfile.journeyId}</span>
                    <LegacyStatusBadge status={memberProfile.legacyStatus} compact />
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="legacy-experience-page__detail">
          {profile ? (
            <div className="legacy-experience-page__grid">
              <LegacyStatusCard profile={profile} />
              <LegacyTimelinePage profile={profile} milestones={milestones} quotes={quotes} />
              {profile.legacyFamily ? (
                <LegacyFamilyCard
                  family={profile.legacyFamily}
                  onRecord={handleRecordLegacyFamily}
                />
              ) : null}
              <LegacyMilestoneCard milestones={profile.anniversaryMilestones} />
            </div>
          ) : (
            <div className="concierge-consultant-card concierge-consultant-card--glass">
              <p className="concierge-consultant__empty">Select a legacy journey to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
