import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EMPTY_LEGACY_INDEX_FILTERS,
  LEGACY_INDEX_SUBCOPY,
  LEGACY_STATUS_DEFINITIONS,
  RELATIONSHIP_LEGACY_INDEX_TITLE,
  type LegacyIndexFilters
} from "../../../constants/relationshipLegacyIndex";
import { JOURNEY_STORY_CATEGORIES } from "../../../constants/journeyStoryCategories";
import {
  fetchAdminConciergeMember,
  fetchAdminConciergeLegacyIndexMembers
} from "../../../services/adminConcierge";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { RelationshipLegacyIndexCard } from "../../signalConcierge/RelationshipLegacyIndexCard";
import { LegacyStatusBadge } from "../../signalConcierge/LegacyStatusBadge";
import { buildLegacyProfileForMember } from "../../../utils/relationshipLegacyIndexProfile";

export function RelationshipLegacyIndexPage() {
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

  const selectedProfile = useMemo(
    () => (selectedMember ? buildLegacyProfileForMember(selectedMember) : null),
    [selectedMember]
  );

  const patchFilters = (partial: Partial<LegacyIndexFilters>) =>
    setFilters((current) => ({ ...current, ...partial }));

  return (
    <div className="relationship-legacy-index-page">
      <header className="relationship-legacy-index-page__head">
        <div>
          <h2>{RELATIONSHIP_LEGACY_INDEX_TITLE}</h2>
          <p>
            {members.length} legacy journeys indexed. {LEGACY_INDEX_SUBCOPY}
          </p>
        </div>
      </header>

      <section className="relationship-legacy-index-page__search concierge-search-bar concierge-consultant-card--glass">
        <label>
          Journey ID
          <input
            value={filters.query}
            onChange={(event) => patchFilters({ query: event.target.value })}
            placeholder="BS-JR-2028-0045"
          />
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
          Story category
          <select
            value={filters.storyCategory}
            onChange={(event) =>
              patchFilters({
                storyCategory: event.target.value as LegacyIndexFilters["storyCategory"]
              })
            }
          >
            <option value="all">All story categories</option>
            {JOURNEY_STORY_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.emoji} {category.label}
              </option>
            ))}
          </select>
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
            <option value="all">All legacy statuses</option>
            {LEGACY_STATUS_DEFINITIONS.map((status) => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          City
          <input value={filters.city} onChange={(event) => patchFilters({ city: event.target.value })} />
        </label>
        <label>
          Country
          <input
            value={filters.country}
            onChange={(event) => patchFilters({ country: event.target.value })}
            placeholder="Nigeria"
          />
        </label>
      </section>

      <div className="relationship-legacy-index-page__body">
        <aside className="relationship-legacy-index-page__list concierge-consultant-card--glass">
          <h3>Indexed journeys</h3>
          {loading ? <p className="concierge-consultant__empty">Loading legacy index…</p> : null}
          {!loading && members.length === 0 ? (
            <p className="concierge-consultant__empty">No legacy journeys match these filters.</p>
          ) : null}
          <ul className="relationship-legacy-index-page__rows">
            {members.map((member) => {
              const profile = buildLegacyProfileForMember(member);
              if (!profile) return null;
              return (
                <li key={member.id}>
                  <button
                    type="button"
                    className={`relationship-legacy-index-page__row${
                      selectedId === member.id ? " is-active" : ""
                    }`}
                    onClick={() => setSelectedId(member.id)}
                  >
                    <strong>{profile.journeyId}</strong>
                    <span>
                      {profile.memberName} · {profile.city}, {profile.country}
                    </span>
                    <LegacyStatusBadge status={profile.legacyStatus} compact />
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="relationship-legacy-index-page__detail">
          {selectedProfile ? (
            <RelationshipLegacyIndexCard profile={selectedProfile} />
          ) : (
            <div className="concierge-consultant-card concierge-consultant-card--glass relationship-legacy-index-page__placeholder cc-reveal">
              <h3>Select a legacy journey</h3>
              <p>Review Journey ID, milestones, story categories, and legacy status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
