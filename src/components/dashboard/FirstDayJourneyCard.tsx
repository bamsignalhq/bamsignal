import { Sparkles } from "lucide-react";
import {
  firstDayProgress,
  getFirstDayChecklist,
  getFirstDayJourney,
  isFirstDayActive
} from "../../utils/firstDayJourney";
import { getJoinedAt } from "../../utils/launchSeed";

type FirstDayJourneyCardProps = {
  onCompleteProfile: () => void;
  onDiscover: () => void;
};

export function FirstDayJourneyCard({ onCompleteProfile, onDiscover }: FirstDayJourneyCardProps) {
  const joinedAt = getJoinedAt();
  if (!isFirstDayActive(joinedAt)) return null;

  const journey = getFirstDayJourney();
  const checklist = getFirstDayChecklist(journey);
  const { done, total } = firstDayProgress(journey);

  if (journey.completedAt) return null;

  return (
    <section className="first-day card dash-animate">
      <header className="first-day__head">
        <Sparkles size={22} aria-hidden />
        <div>
          <h2>Welcome to BamSignal</h2>
          <p>Your first day journey — {done}/{total} complete</p>
        </div>
      </header>
      <ul className="first-day__list">
        {checklist.map((item) => (
          <li key={item.id} className={item.done ? "done" : ""}>
            <span aria-hidden>{item.done ? "✓" : "○"}</span>
            {item.label}
          </li>
        ))}
      </ul>
      <div className="first-day__actions">
        {!journey.profileComplete && (
          <button type="button" className="btn-primary" onClick={onCompleteProfile}>
            Complete profile
          </button>
        )}
        <button type="button" className="btn-secondary" onClick={onDiscover}>
          Discover profiles
        </button>
      </div>
    </section>
  );
}
