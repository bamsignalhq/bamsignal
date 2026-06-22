import { type FormEvent } from "react";
import {
  CELEBRATING_YOUR_STORY_LABEL,
  JOURNEY_LABEL,
  LEGACY_LABEL
} from "../../../constants/relationshipLegacyExperience";
import {
  LEGACY_FAMILY_CHILDREN_LABEL,
  LEGACY_FAMILY_CURRENT_COUNTRY_LABEL,
  LEGACY_FAMILY_PRIVACY_COPY,
  LEGACY_FAMILIES_TITLE
} from "../../../constants/relationshipLegacyIndex";
import type { LegacyFamilyViewModel } from "../../../utils/relationshipLegacyIndexLogic";
import { LegacyStatusBadge } from "../../signalConcierge/LegacyStatusBadge";

type LegacyFamilyCardProps = {
  family: LegacyFamilyViewModel;
  readOnly?: boolean;
  onRecord?: (input: { childrenCount: number; currentCountry: string }) => void;
};

function FamilyRow({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === "") return null;
  return (
    <div className="legacy-experience-family-card__row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function LegacyFamilyCard({ family, readOnly = true, onRecord }: LegacyFamilyCardProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (readOnly || !onRecord) return;
    const form = new FormData(event.currentTarget);
    const childrenCount = Number(form.get("childrenCount"));
    const currentCountry = String(form.get("currentCountry") ?? "").trim();
    if (!currentCountry || Number.isNaN(childrenCount)) return;
    onRecord({ childrenCount, currentCountry });
    event.currentTarget.reset();
  };

  return (
    <section className="legacy-experience-family-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{LEGACY_FAMILIES_TITLE}</h3>
        <p>
          {LEGACY_LABEL} · {JOURNEY_LABEL} · {CELEBRATING_YOUR_STORY_LABEL}
        </p>
      </header>

      <p className="legacy-experience-family-card__privacy">{LEGACY_FAMILY_PRIVACY_COPY}</p>

      <div className="legacy-experience-family-card__journey">
        <span>Journey ID</span>
        <strong>{family.journeyId}</strong>
      </div>

      <div className="legacy-experience-family-card__grid">
        <FamilyRow label="Met" value={family.metYear} />
        <FamilyRow label="Married" value={family.marriedYear} />
        <FamilyRow label={LEGACY_FAMILY_CHILDREN_LABEL} value={family.childrenCount} />
        <FamilyRow label={LEGACY_FAMILY_CURRENT_COUNTRY_LABEL} value={family.currentCountry} />
      </div>

      <div className="legacy-experience-family-card__status">
        <LegacyStatusBadge status={family.legacyStatus} />
      </div>

      {!readOnly && onRecord ? (
        <form className="legacy-experience-family-card__form" onSubmit={handleSubmit}>
          <h4>Record family milestone</h4>
          <div className="legacy-experience-family-card__form-grid">
            <label>
              Children
              <input
                name="childrenCount"
                type="number"
                min={family.childrenCount}
                step={1}
                defaultValue={family.childrenCount}
                required
              />
            </label>
            <label>
              Current country
              <input
                name="currentCountry"
                type="text"
                defaultValue={family.currentCountry}
                required
              />
            </label>
          </div>
          <button type="submit" className="concierge-consultant-btn concierge-consultant-btn--primary">
            Save family milestone
          </button>
        </form>
      ) : null}
    </section>
  );
}
