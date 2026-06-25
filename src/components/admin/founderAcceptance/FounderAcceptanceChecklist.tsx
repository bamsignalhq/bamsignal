import type { FatCheck, FatPersonaResult } from "../../../types/founderAcceptance";

type FounderAcceptanceChecklistProps = {
  checklist: FatCheck[];
  personas: FatPersonaResult[];
};

export function FounderAcceptanceChecklist({ checklist, personas }: FounderAcceptanceChecklistProps) {
  return (
    <section className="institutional-card fat-checklist-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Persona walkthrough</h3>
        <p>Every major workflow verified as guest, member, consultant, ops, and admin would use it.</p>
      </header>

      <ul className="institutional-card__list">
        {checklist.map((item) => (
          <li
            key={item.id}
            className={item.passed ? "fat-checklist-card__item--passed" : "fat-checklist-card__item--failed"}
          >
            <div className="institutional-card__row">
              <strong>{item.label}</strong>
              <span
                className={
                  item.passed ? "fat-checklist-card__badge--pass" : "fat-checklist-card__badge--fail"
                }
              >
                {item.passed ? "Passed" : "Review"}
              </span>
            </div>
            <div className="institutional-card__meta">
              <span>{item.checkRef}</span>
              <span>{item.personaId}</span>
            </div>
            <p>{item.detail}</p>
          </li>
        ))}
      </ul>

      <div className="fat-checklist-card__personas">
        <h4>Persona scores</h4>
        <ul>
          {personas.map((persona) => (
            <li key={persona.id}>
              <span>{persona.label}</span>
              <span className={`fat-status fat-status--${persona.status}`}>
                {persona.score} · {persona.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
