import { SIGNAL_CONCIERGE_TIERS } from "../../../constants/signalConcierge";
import { SIGNAL_CONCIERGE_STATUS_LABELS } from "../../../constants/signalConcierge";
import { RELATIONSHIP_JOURNEY_STATUS_LABELS } from "../../../constants/conciergeJourneyArchive";
import type { ConciergeMemberFilters } from "../../../types/conciergeConsultant";
import { CONCIERGE_MEMBER_FLAGS } from "../../../constants/conciergeConsultant";

type ConsultantSearchBarProps = {
  filters: ConciergeMemberFilters;
  onChange: (filters: ConciergeMemberFilters) => void;
};

export function ConsultantSearchBar({ filters, onChange }: ConsultantSearchBarProps) {
  const patch = (partial: Partial<ConciergeMemberFilters>) => onChange({ ...filters, ...partial });

  return (
    <section className="concierge-search-bar concierge-consultant-card--glass" aria-label="Search members">
      <label>
        Search
        <input
          value={filters.query}
          onChange={(event) => patch({ query: event.target.value })}
          placeholder="Journey ID, name, city, status"
        />
      </label>
      <label>
        Status
        <select
          value={filters.status}
          onChange={(event) => patch({ status: event.target.value as ConciergeMemberFilters["status"] })}
        >
          <option value="all">All statuses</option>
          {Object.entries(SIGNAL_CONCIERGE_STATUS_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Consultant
        <input
          value={filters.consultant}
          onChange={(event) => patch({ consultant: event.target.value })}
          placeholder="Consultant name"
        />
      </label>
      <label>
        Archive status
        <select
          value={filters.archiveStatus}
          onChange={(event) =>
            patch({ archiveStatus: event.target.value as ConciergeMemberFilters["archiveStatus"] })
          }
        >
          <option value="all">All relationship statuses</option>
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
          onChange={(event) => patch({ marriageYear: event.target.value })}
          placeholder="e.g. 2030"
        />
      </label>
      <label>
        Tier
        <select
          value={filters.tier}
          onChange={(event) => patch({ tier: event.target.value as ConciergeMemberFilters["tier"] })}
        >
          <option value="all">All tiers</option>
          {SIGNAL_CONCIERGE_TIERS.map((tier) => (
            <option key={tier.id} value={tier.id}>
              {tier.landingName} · {tier.tagline}
            </option>
          ))}
        </select>
      </label>
      <label>
        City
        <input value={filters.city} onChange={(event) => patch({ city: event.target.value })} />
      </label>
      <label>
        Religion
        <input value={filters.religion} onChange={(event) => patch({ religion: event.target.value })} />
      </label>
      <label>
        Age min
        <input
          inputMode="numeric"
          value={filters.ageMin}
          onChange={(event) => patch({ ageMin: event.target.value })}
        />
      </label>
      <label>
        Age max
        <input
          inputMode="numeric"
          value={filters.ageMax}
          onChange={(event) => patch({ ageMax: event.target.value })}
        />
      </label>
      <label>
        Children preference
        <input
          value={filters.childrenPreference}
          onChange={(event) => patch({ childrenPreference: event.target.value })}
        />
      </label>
      <label>
        Relationship goals
        <input
          value={filters.relationshipGoal}
          onChange={(event) => patch({ relationshipGoal: event.target.value })}
        />
      </label>
      <div className="concierge-search-bar__flags">
        {CONCIERGE_MEMBER_FLAGS.filter((flag) => flag.id === "relocation" || flag.id === "diaspora").map(
          (flag) => {
            const active = flag.id === "relocation" ? filters.relocation : filters.diaspora;
            return (
              <button
                key={flag.id}
                type="button"
                className={`concierge-search-bar__flag${active ? " is-active" : ""}`}
                onClick={() =>
                  patch(
                    flag.id === "relocation"
                      ? { relocation: !filters.relocation }
                      : { diaspora: !filters.diaspora }
                  )
                }
              >
                {flag.label}
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}
