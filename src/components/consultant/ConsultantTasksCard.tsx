import type { ConsultantCrmTask } from "../../types/consultantCrm";

type ConsultantTasksCardProps = {
  tasks: ConsultantCrmTask[];
};

export function ConsultantTasksCard({ tasks }: ConsultantTasksCardProps) {
  return (
    <section className="consultant-crm-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Tasks</h3>
        <p>Open follow-ups and consultant actions</p>
      </header>
      {tasks.length === 0 ? (
        <p className="concierge-consultant__empty">No open tasks.</p>
      ) : (
        <ul className="consultant-crm-task-list">
          {tasks.slice(0, 8).map((task) => (
            <li key={task.id} className={task.overdue ? "consultant-crm-task-list__item--overdue" : undefined}>
              <strong>{task.title}</strong>
              <span>{task.memberName}</span>
              <time dateTime={task.dueAt}>
                {task.overdue ? "Overdue · " : "Due · "}
                {new Date(task.dueAt).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
