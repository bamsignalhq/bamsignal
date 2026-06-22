import {
  JOURNEY_TRANSITION_SUBCOPY,
  JOURNEY_TRANSITION_TITLE
} from "../../../constants/conciergeJourneyContinuity";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { getLatestJourneyTransition, journeyTransitionMessage } from "../../../utils/conciergeJourneyContinuity";
import { getMemberStewardName } from "../../../utils/conciergeMemberStewardship";

type JourneyTransitionCardProps = {
  member: ConciergeMemberRecord;
  consultants?: { id: string; name: string; status?: string }[];
  onTransition?: (consultantId: string, reason: string) => void;
  readOnly?: boolean;
};

export function JourneyTransitionCard({
  member,
  consultants = [],
  onTransition,
  readOnly = false
}: JourneyTransitionCardProps) {
  const latest = getLatestJourneyTransition(member.stewardshipHistory ?? []);
  const currentName = getMemberStewardName(member);
  const activeConsultants = consultants.filter(
    (c) => c.status !== "inactive" && c.status !== "frozen"
  );

  const headline = latest?.fromConsultantName
    ? journeyTransitionMessage(latest.fromConsultantName, latest.toConsultantName)
    : currentName
      ? `Stewarded by ${currentName} under BamSignal continuity support.`
      : "Awaiting steward assignment for this relationship journey.";

  return (
    <section className="journey-transition-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{JOURNEY_TRANSITION_TITLE}</h3>
        <p>{JOURNEY_TRANSITION_SUBCOPY}</p>
      </header>
      <p className="journey-transition-card__headline">{headline}</p>
      {latest?.reason ? (
        <p className="journey-transition-card__reason">
          <span>Reason</span> {latest.reason}
        </p>
      ) : null}
      {!readOnly && onTransition && activeConsultants.length ? (
        <div className="journey-transition-card__form">
          <label>
            Continuity steward
            <select
              defaultValue=""
              onChange={(event) => {
                const id = event.target.value;
                if (!id) return;
                onTransition(id, "Continuity support — steward transition");
              }}
            >
              <option value="" disabled>
                Select consultant
              </option>
              {activeConsultants.map((consultant) => (
                <option key={consultant.id} value={consultant.id}>
                  {consultant.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </section>
  );
}
