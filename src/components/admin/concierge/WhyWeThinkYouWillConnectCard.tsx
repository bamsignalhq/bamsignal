import {
  CONNECTION_REASON_EXAMPLES,
  WHY_WE_THINK_YOULL_CONNECT_TITLE
} from "../../../constants/conciergeIntroduction";
import type { IntroductionRecord } from "../../../types/conciergeIntroduction";
import { updateIntroductionConnectionReasons } from "../../../utils/IntroductionEngine";

type WhyWeThinkYouWillConnectCardProps = {
  record: IntroductionRecord;
  onUpdated: () => void;
};

export function WhyWeThinkYouWillConnectCard({
  record,
  onUpdated
}: WhyWeThinkYouWillConnectCardProps) {
  const handleAdd = (reason: string) => {
    if (record.connectionReasons.includes(reason)) return;
    updateIntroductionConnectionReasons(record.id, [...record.connectionReasons, reason]);
    onUpdated();
  };

  const handleRemove = (reason: string) => {
    updateIntroductionConnectionReasons(
      record.id,
      record.connectionReasons.filter((item) => item !== reason)
    );
    onUpdated();
  };

  return (
    <section className="introduction-connect concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>{WHY_WE_THINK_YOULL_CONNECT_TITLE}</h3>
        <p>Warm, human reasons — visible to members when presented.</p>
      </header>
      <div className="introduction-connect__examples">
        {CONNECTION_REASON_EXAMPLES.map((reason) => (
          <button
            key={reason}
            type="button"
            className={`introduction-connect__chip${record.connectionReasons.includes(reason) ? " is-active" : ""}`}
            onClick={() =>
              record.connectionReasons.includes(reason) ? handleRemove(reason) : handleAdd(reason)
            }
          >
            {reason}
          </button>
        ))}
      </div>
      {record.connectionReasons.length ? (
        <ul className="introduction-connect__list">
          {record.connectionReasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      ) : (
        <p className="concierge-consultant__empty">Add connection reasons members will see.</p>
      )}
    </section>
  );
}
