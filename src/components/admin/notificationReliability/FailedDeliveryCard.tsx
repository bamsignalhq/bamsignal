import type { ReliabilityNotificationRecord } from "../../../types/notificationReliability";
import { NotificationCard } from "./NotificationCard";

type FailedDeliveryCardProps = {
  records: ReliabilityNotificationRecord[];
  selectedId: string | null;
  onSelect: (recordId: string) => void;
};

export function FailedDeliveryCard({ records, selectedId, onSelect }: FailedDeliveryCardProps) {
  return (
    <section className="failed-delivery-card concierge-consultant-card--glass cc-reveal">
      <header className="failed-delivery-card__head">
        <h3>Failed deliveries</h3>
        <p>{records.length} notification(s) require operator attention.</p>
      </header>
      {records.length ? (
        <div className="failed-delivery-card__list">
          {records.map((record) => (
            <NotificationCard
              key={record.id}
              record={record}
              selected={selectedId === record.id}
              onSelect={() => onSelect(record.id)}
            />
          ))}
        </div>
      ) : (
        <p className="failed-delivery-card__empty">No failed deliveries in the current snapshot.</p>
      )}
    </section>
  );
}
