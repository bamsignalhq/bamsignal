import { INTRODUCTION_ID_LABEL } from "../../../constants/introductionId";
import { confidenceLabel } from "../../../constants/conciergeIntroduction";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";
import { getMemberDisplayName } from "../../../utils/IntroductionEngine";
import { IntroductionStatusBadge } from "./IntroductionStatusBadge";

type IntroductionHeaderProps = {
  record: IntroductionRecord;
};

export function IntroductionHeader({ record }: IntroductionHeaderProps) {
  return (
    <header className="introduction-header concierge-consultant-card--glass">
      <div className="introduction-header__main">
        <p className="introduction-header__id">
          {INTRODUCTION_ID_LABEL}: <strong>{record.introductionId}</strong>
        </p>
        <h3 className="introduction-header__title">
          {getMemberDisplayName(record.memberAId)} & {getMemberDisplayName(record.memberBId)}
        </h3>
        <p className="introduction-header__subtitle">Thoughtful Introduction · Relationship Journey</p>
      </div>
      <div className="introduction-header__meta">
        <IntroductionStatusBadge status={record.status} />
        {record.confidenceLevel ? (
          <span className={`introduction-confidence-badge introduction-confidence-badge--${record.confidenceLevel}`}>
            {confidenceLabel(record.confidenceLevel)}
          </span>
        ) : null}
        {record.consultantName ? (
          <span className="introduction-header__consultant">{record.consultantName}</span>
        ) : null}
        <time dateTime={record.createdAt} className="introduction-header__date">
          {new Date(record.createdAt).toLocaleDateString()}
        </time>
      </div>
      <div className="introduction-header__journeys">
        <span>Journey A: {record.journeyAId ?? "—"}</span>
        <span>Journey B: {record.journeyBId ?? "—"}</span>
      </div>
      {record.compatibilitySummary ? (
        <p className="introduction-header__summary">{record.compatibilitySummary}</p>
      ) : null}
    </header>
  );
}
