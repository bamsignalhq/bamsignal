import { useMemo, useState } from "react";
import {
  LEGACY_FAMILIES_ARCHITECTURE_SUBCOPY,
  LEGACY_FAMILIES_ARCHITECTURE_TITLE,
  LEGACY_FAMILIES_PRIVACY_COPY
} from "../../../../constants/legacyFamilies";
import { LEGACY_FAMILIES_ARCHITECTURE_JOURNEY_IDS } from "../../../../data/legacyFamiliesSeed";
import { getLegacyFamiliesBundle } from "../../../../utils/LegacyFamiliesEngine";
import { FamilyGrowthCard } from "./FamilyGrowthCard";
import { FamilyTimelineCard } from "./FamilyTimelineCard";
import { LegacyChildrenCard } from "./LegacyChildrenCard";
import { LegacyFamilyStatusBadge } from "./LegacyFamilyStatusBadge";

type LegacyFamilyPageProps = {
  journeyId?: string;
};

export function LegacyFamilyPage({ journeyId: journeyIdProp }: LegacyFamilyPageProps) {
  const defaultJourneyId = journeyIdProp ?? LEGACY_FAMILIES_ARCHITECTURE_JOURNEY_IDS[0] ?? "";
  const [journeyId, setJourneyId] = useState(defaultJourneyId);

  const bundle = useMemo(() => getLegacyFamiliesBundle(journeyId), [journeyId]);

  return (
    <div className="legacy-families-page">
      <header className="legacy-families-page__head">
        <h2>{LEGACY_FAMILIES_ARCHITECTURE_TITLE}</h2>
        <p>{LEGACY_FAMILIES_ARCHITECTURE_SUBCOPY}</p>
        <p className="legacy-families-page__privacy">{LEGACY_FAMILIES_PRIVACY_COPY}</p>
      </header>

      {LEGACY_FAMILIES_ARCHITECTURE_JOURNEY_IDS.length > 1 ? (
        <div className="legacy-families-page__picker concierge-consultant-card--glass">
          <label htmlFor="legacy-families-journey-picker">
            Journey
            <select
              id="legacy-families-journey-picker"
              value={journeyId}
              onChange={(event) => setJourneyId(event.target.value)}
            >
              {LEGACY_FAMILIES_ARCHITECTURE_JOURNEY_IDS.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <div className="legacy-families-page__status concierge-consultant-card--glass">
        <span>Legacy Status</span>
        <LegacyFamilyStatusBadge status={bundle.family.familyStatus} primary />
      </div>

      <div className="legacy-families-page__grid">
        <LegacyChildrenCard family={bundle.family} />
        <FamilyGrowthCard family={bundle.family} />
        <FamilyTimelineCard
          displayRows={bundle.displayRows}
          milestoneEntries={bundle.milestoneEntries}
        />
      </div>
    </div>
  );
}
