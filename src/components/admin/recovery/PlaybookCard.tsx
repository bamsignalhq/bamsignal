import { PLAYBOOK_LABELS, RECOVERY_PLAN_STATUS_LABELS } from "../../../constants/recoveryCenter";
import type { PlaybookRecord } from "../../../types/recoveryCenter";

type PlaybookCardProps = {
  playbooks: PlaybookRecord[];
};

export function PlaybookCard({ playbooks }: PlaybookCardProps) {
  return (
    <section className="recovery-card playbook-card concierge-consultant-card--glass cc-reveal">
      <header className="recovery-card__head">
        <h3>Incident playbooks</h3>
        <p>Database, payment, email, WhatsApp, Supabase, operations, and security incidents.</p>
      </header>
      {playbooks.length ? (
        <ul className="recovery-card__list">
          {playbooks.map((playbook) => (
            <li key={playbook.id}>
              <div className="recovery-card__row">
                <strong>{PLAYBOOK_LABELS[playbook.playbookId]}</strong>
                <span className={`playbook-card__status playbook-card__status--${playbook.status}`}>
                  {RECOVERY_PLAN_STATUS_LABELS[playbook.status]}
                </span>
              </div>
              <p>{playbook.playbookRef}</p>
              <div className="recovery-card__meta">
                <span>RTO {playbook.rtoMinutes}m</span>
                <span>RPO {playbook.rpoMinutes}m</span>
                <span>{playbook.owner}</span>
              </div>
              <ol className="playbook-card__steps">
                {playbook.steps.slice(0, 3).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      ) : (
        <p className="recovery-card__empty">No playbooks configured.</p>
      )}
    </section>
  );
}
