import { COMPATIBILITY_REVIEW_LABEL } from "../../../constants/conciergeIntroduction";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";

type IntroductionCompatibilityCardProps = {
  record: IntroductionRecord;
};

const FIELDS: { key: keyof NonNullable<IntroductionRecord["compatibility"]>; label: string }[] = [
  { key: "faith", label: "Faith" },
  { key: "lifestyle", label: "Lifestyle" },
  { key: "marriageTimeline", label: "Marriage Timeline" },
  { key: "familyValues", label: "Family Values" },
  { key: "childrenPreference", label: "Children Preference" },
  { key: "communicationStyle", label: "Communication Style" },
  { key: "loveLanguage", label: "Love Language" },
  { key: "careerCompatibility", label: "Career Compatibility" },
  { key: "location", label: "Location" },
  { key: "relocationOpenness", label: "Relocation Openness" },
  { key: "dealBreakers", label: "Deal Breakers" }
];

export function IntroductionCompatibilityCard({ record }: IntroductionCompatibilityCardProps) {
  const compatibility = record.compatibility;

  return (
    <section className="introduction-compatibility concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>{COMPATIBILITY_REVIEW_LABEL}</h3>
        <p>Shared Values review — consultants only.</p>
      </header>

      {record.compatibilitySummary ? (
        <p className="introduction-compatibility__summary">{record.compatibilitySummary}</p>
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
    </section>
  );
}
