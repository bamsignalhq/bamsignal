import { useEffect, useMemo, useState } from "react";
import { CONSULTATION_SCHEDULER_BRAND } from "../../../constants/consultationScheduler";
import {
  getConsultationMeeting,
  listConsultationAvailability,
  listPastConsultations,
  listUpcomingConsultations,
  syncConsultationMeetingsFromSources
} from "../../../utils/consultationScheduler";
import { ConsultationCalendarCard } from "./ConsultationCalendarCard";
import { MeetingDetailsCard } from "./MeetingDetailsCard";
import { UpcomingConsultationsCard } from "./UpcomingConsultationsCard";

export function ConsultationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    syncConsultationMeetingsFromSources();
    setReady(true);
  }, []);

  const upcoming = useMemo(() => (ready ? listUpcomingConsultations() : []), [ready]);
  const past = useMemo(() => (ready ? listPastConsultations() : []), [ready]);
  const allMeetings = useMemo(() => [...upcoming, ...past], [upcoming, past]);
  const availability = useMemo(() => (ready ? listConsultationAvailability() : []), [ready]);

  const selected = useMemo(() => {
    if (!ready) return null;
    if (selectedId) return getConsultationMeeting(selectedId);
    return upcoming[0] ?? past[0] ?? null;
  }, [ready, selectedId, upcoming, past]);

  if (!ready) {
    return <p className="concierge-consultant__empty">Loading consultations…</p>;
  }

  return (
    <div className="concierge-consultations-page">
      <header className="concierge-consultations-page__head">
        <div>
          <h3>{CONSULTATION_SCHEDULER_BRAND}</h3>
          <p>Structured consultation management before live operations.</p>
        </div>
      </header>

      <div className="concierge-consultations-page__grid">
        <ConsultationCalendarCard availability={availability} meetings={allMeetings} />
        <UpcomingConsultationsCard
          meetings={upcoming}
          selectedId={selected?.id}
          onSelect={setSelectedId}
        />
        <UpcomingConsultationsCard
          meetings={past}
          selectedId={selected?.id}
          onSelect={setSelectedId}
          title="Past Consultations"
          emptyLabel="No past consultations logged yet."
        />
      </div>

      {selected ? (
        <MeetingDetailsCard meeting={selected} />
      ) : (
        <div className="concierge-consultant-card concierge-consultant-card--glass concierge-consultant-dashboard__placeholder cc-reveal">
          <h3>Select a consultation</h3>
          <p>Review meeting ID, consultant, journey ID, schedule, channel, and status.</p>
        </div>
      )}
    </div>
  );
}
