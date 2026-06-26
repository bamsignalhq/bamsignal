import type { NotificationQueueSnapshot } from "../../../types/notificationReliability";

type NotificationQueuesCardProps = {
  queues: NotificationQueueSnapshot[];
  activeQueue: string;
  onSelect: (queueId: string) => void;
};

export function NotificationQueuesCard({ queues, activeQueue, onSelect }: NotificationQueuesCardProps) {
  return (
    <section className="notification-queues-card concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Message queues</h3>
        <p>Email, WhatsApp, Push, Scheduled, Retry, and Dead Letter queues.</p>
      </header>
      <div className="notification-queues-card__grid">
        <button
          type="button"
          className={`notification-queue-chip${activeQueue === "all" ? " is-active" : ""}`}
          onClick={() => onSelect("all")}
        >
          <strong>All</strong>
          <span>{queues.reduce((sum, queue) => sum + queue.count, 0)} messages</span>
        </button>
        {queues.map((queue) => (
          <button
            key={queue.id}
            type="button"
            className={`notification-queue-chip${activeQueue === queue.id ? " is-active" : ""}`}
            onClick={() => onSelect(queue.id)}
          >
            <strong>{queue.label}</strong>
            <span>
              {queue.count} message{queue.count === 1 ? "" : "s"}
              {queue.oldestAt ? ` · oldest ${new Date(queue.oldestAt).toLocaleTimeString()}` : ""}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
