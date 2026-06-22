import { INTRODUCTION_PRIVACY_COPY } from "../../../constants/conciergeIntroduction";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";
import { isInternalCandidateRecord } from "../../../utils/introductionEngineLogic";
import { getMemberDisplayName } from "../../../utils/IntroductionEngine";

type PrivateIntroductionCardProps = {
  records: IntroductionRecord[];
};

export function PrivateIntroductionCard({ records }: PrivateIntroductionCardProps) {
  const internal = records.filter((record) => isInternalCandidateRecord(record));

  if (!internal.length) {
    return (
      <section className="introduction-private concierge-consultant-card--glass">
        <header className="concierge-consultant-card__head">
          <h3>Private candidate pool</h3>
          <p>Consultants only — members never see internal reviews.</p>
        </header>
        <p className="concierge-consultant__empty">No internal candidates in review.</p>
      </section>
    );
  }

  return (
    <section className="introduction-private concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>Private candidate pool</h3>
        <p>Internal Compatibility Review — never visible to members.</p>
      </header>
      <ul className="introduction-private__list">
        {internal.map((record) => (
          <li key={record.id}>
            <span className="introduction-private__id">{record.introductionId}</span>
            <strong>
              {getMemberDisplayName(record.memberAId)} & {getMemberDisplayName(record.memberBId)}
            </strong>
            <span className="introduction-private__status">Under consultant review</span>
          </li>
        ))}
      </ul>
      <p className="introduction-private__policy">{INTRODUCTION_PRIVACY_COPY}</p>
    </section>
  );
}
