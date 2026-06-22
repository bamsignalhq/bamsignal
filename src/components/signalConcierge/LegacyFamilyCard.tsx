import { type FormEvent } from "react";
import {
  LEGACY_FAMILY_CHILDREN_LABEL,
  LEGACY_FAMILY_CURRENT_COUNTRY_LABEL,
  LEGACY_FAMILY_PRIVACY_COPY,
  LEGACY_FAMILIES_TITLE,
  LEGACY_STATUS_LABEL
} from "../../constants/relationshipLegacyIndex";
import type { LegacyFamilyViewModel } from "../../utils/relationshipLegacyIndexLogic";
import { LegacyStatusBadge } from "./LegacyStatusBadge";

type LegacyFamilyCardProps = {
  family: LegacyFamilyViewModel;
  /** Admin may record children count and current country. */
  readOnly?: boolean;
  onRecord?: (input: { childrenCount: number; currentCountry: string }) => void;
};

function FamilyMilestoneRow({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === "") return null;
  return (
    <div className="legacy-family-card__row">
      <span className="legacy-family-card__label">{label}</span>
      <strong className="legacy-family-card__value">{value}</strong>
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
    <section className="legacy-family-card">
      <header className="legacy-family-card__head">
        <p className="legacy-family-card__eyebrow">{LEGACY_FAMILIES_TITLE}</p>
        <p className="legacy-family-card__privacy">{LEGACY_FAMILY_PRIVACY_COPY}</p>
      </header>

      <div className="legacy-family-card__journey-id">
        <span>Journey ID</span>
        <strong>{family.journeyId}</strong>
      </div>

      <div className="legacy-family-card__milestones">
        <FamilyMilestoneRow label="Met" value={family.metYear} />
        <FamilyMilestoneRow label="Married" value={family.marriedYear} />
        <FamilyMilestoneRow label={LEGACY_FAMILY_CHILDREN_LABEL} value={family.childrenCount} />
        <FamilyMilestoneRow
          label={LEGACY_FAMILY_CURRENT_COUNTRY_LABEL}
          value={family.currentCountry}
        />
      </div>

      <div className="legacy-family-card__status">
        <span>{LEGACY_STATUS_LABEL}</span>
        <LegacyStatusBadge status={family.legacyStatus} />
      </div>

      {!readOnly && onRecord ? (
        <form className="legacy-family-card__admin" onSubmit={handleSubmit}>
          <h4>Record family milestone</h4>
          <p>Children count and current country only — no names or sensitive data.</p>
          <div className="legacy-family-card__admin-grid">
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
                placeholder="Canada"
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
