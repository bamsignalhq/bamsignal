import { COMPATIBILITY_REVIEW_LABEL } from "../../../constants/conciergeIntroduction";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";

type IntroductionCompatibilityCardProps = {
  record: IntroductionRecord;
};

const FIELDS: { key: keyof NonNullable<IntroductionRecord["compatibility"]>; label: string }[] = [
  { key: "faith", label: "Faith" },
  { key: "lifestyle", label: "Lifestyle" },
  { key: "marriageTimeline", label: "Marriage timeline" },
  { key: "familyValues", label: "Family values" },
  { key: "childrenPreference", label: "Children preference" },
  { key: "location", label: "Location" },
  { key: "relocationOpenness", label: "Relocation openness" },
  { key: "communicationStyle", label: "Communication style" },
  { key: "loveLanguage", label: "Love language" },
  { key: "dealBreakers", label: "Deal breakers" }
];

export function IntroductionCompatibilityCard({ record }: IntroductionCompatibilityCardProps) {
  const compatibility = record.compatibility;

  return (
    <section className="introduction-compatibility concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>{COMPATIBILITY_REVIEW_LABEL}</h3>
        <p>Shared Values review — consultants only.</p>
      </header>

      {record.compatibilityScore != null ? (
        <p className="introduction-compatibility__score">
          Compatibility score: <strong>{record.compatibilityScore}</strong>
        </p>
      ) : null}

      {compatibility ? (
        <dl className="introduction-compatibility__grid">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <dt>{field.label}</dt>
              <dd>{compatibility[field.key]}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="concierge-consultant__empty">Compatibility review pending.</p>
      )}

      {record.matchNotes.length ? (
        <div className="introduction-compatibility__notes">
          <h4>Match notes</h4>
          <p className="introduction-compatibility__private">Private — consultants only.</p>
          <ul>
            {record.matchNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
