import {
  CONCIERGE_FOLLOW_UP_TASK_LEGACY_LABELS,
  CONCIERGE_FOLLOW_UP_TASK_TYPES,
  CONCIERGE_FOLLOW_UP_TITLE
} from "../../../constants/conciergeConsultant";
import type { ConciergeFollowUpTask } from "../../../types/conciergeConsultant";

type FollowUpTasksCardProps = {
  tasks: ConciergeFollowUpTask[];
};

function taskLabel(type: ConciergeFollowUpTask["type"]): string {
  return (
    CONCIERGE_FOLLOW_UP_TASK_TYPES.find((item) => item.id === type)?.label ??
    CONCIERGE_FOLLOW_UP_TASK_LEGACY_LABELS[type] ??
    type
  );
}

export function FollowUpTasksCard({ tasks }: FollowUpTasksCardProps) {
  const openTasks = [...tasks]
    .filter((task) => !task.completed)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  return (
    <section className="concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{CONCIERGE_FOLLOW_UP_TITLE}</h3>
        <p>{openTasks.length} open reminder{openTasks.length === 1 ? "" : "s"}</p>
      </header>
      {openTasks.length ? (
        <ul className="concierge-consultant-list">
          {openTasks.map((task) => (
            <li key={task.id} className="concierge-consultant-list__item">
              <div>
                <strong>{task.title || taskLabel(task.type)}</strong>
                <p>{taskLabel(task.type)}</p>
                {task.note ? <p className="concierge-consultant-list__note">{task.note}</p> : null}
              </div>
              <time dateTime={task.dueAt}>Due {new Date(task.dueAt).toLocaleDateString()}</time>
            </li>
          ))}
        </ul>
      ) : (
        <p className="concierge-consultant__empty">No open follow-up reminders.</p>
      )}
    </section>
  );
}
