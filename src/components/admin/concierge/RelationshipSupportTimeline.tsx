import { RELATIONSHIP_SUPPORT_TIMELINE_PHASES } from "../../../constants/RelationshipSupportRole";

export function RelationshipSupportTimeline() {
  return (
    <section className="relationship-support-timeline concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Journey Support pathway</h3>
        <p>Reserved architecture — permissions and scheduling not enabled yet.</p>
      </header>
      <ol className="relationship-support-timeline__list">
        {RELATIONSHIP_SUPPORT_TIMELINE_PHASES.map((phase) => (
          <li
            key={phase.id}
            className={`relationship-support-timeline__item${
              !phase.reserved ? " relationship-support-timeline__item--active" : ""
            }`}
          >
            <span className="relationship-support-timeline__dot" aria-hidden />
            <div>
              <p className="relationship-support-timeline__label">{phase.label}</p>
              {phase.reserved ? (
                <span className="relationship-support-timeline__reserved">Future ready</span>
              ) : (
                <span className="relationship-support-timeline__ready">Architecture mapped</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
