import type { ConsultantCrmAgendaItem } from "../../types/consultantCrm";

type ConsultantAgendaCardProps = {
  agenda: ConsultantCrmAgendaItem[];
};

export function ConsultantAgendaCard({ agenda }: ConsultantAgendaCardProps) {
  return (
    <section className="consultant-crm-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Agenda</h3>
        <p>Upcoming consultations and meetings</p>
      </header>
      {agenda.length === 0 ? (
        <p className="concierge-consultant__empty">No upcoming meetings scheduled.</p>
      ) : (
        <ul className="consultant-crm-agenda">
          {agenda.slice(0, 6).map((item) => (
            <li key={item.id}>
              <strong>{item.memberName}</strong>
              <span>{item.channel}</span>
              <time dateTime={item.scheduledAt}>{new Date(item.scheduledAt).toLocaleString()}</time>
              {item.notes ? <p>{item.notes}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
