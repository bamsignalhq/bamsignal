import { useEffect, useMemo, useState } from "react";
import { CONSULTATION_SCHEDULER_BRAND } from "../../../constants/consultationScheduler";
import { CALENDAR_ENGINE_BRAND } from "../../../constants/calendar";
import {
  getConsultationMeeting,
  listConsultationAvailability,
  listPastConsultations,
  listUpcomingConsultations,
  syncConsultationMeetingsFromSources
} from "../../../utils/consultationScheduler";
import {
  listConsultationEvents,
  syncCalendarAvailabilityFromConsultants
} from "../../../utils/CalendarEngine";
import { AvailabilityCard } from "../../signalConcierge/AvailabilityCard";
import { CalendarCard } from "../../signalConcierge/CalendarCard";
import { CalendarTimelineCard } from "../../signalConcierge/CalendarTimelineCard";
import { UpcomingConsultationCard } from "../../signalConcierge/UpcomingConsultationCard";
import { ConsultationCalendarCard } from "./ConsultationCalendarCard";
import { MeetingDetailsCard } from "./MeetingDetailsCard";
import { UpcomingConsultationsCard } from "./UpcomingConsultationsCard";

export function ConsultationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    syncConsultationMeetingsFromSources();
    syncCalendarAvailabilityFromConsultants();
    setReady(true);
  }, []);

  const upcoming = useMemo(() => (ready ? listUpcomingConsultations() : []), [ready]);
  const past = useMemo(() => (ready ? listPastConsultations() : []), [ready]);
  const allMeetings = useMemo(() => [...upcoming, ...past], [upcoming, past]);
  const availability = useMemo(() => (ready ? listConsultationAvailability() : []), [ready]);
  const calendarEvents = useMemo(() => (ready ? listConsultationEvents() : []), [ready]);
  const primaryAvailability = availability[0] ?? null;
  const primaryCalendarEvent = calendarEvents[0] ?? null;

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
          <p>
            {CALENDAR_ENGINE_BRAND} — consultant availability, Google Calendar events, and private invitations.
          </p>
        </div>
      </header>

      {primaryAvailability ? (
        <div className="concierge-consultations-page__calendar-grid">
          <AvailabilityCard availability={primaryAvailability} />
          <CalendarCard availability={primaryAvailability} />
          <UpcomingConsultationCard event={primaryCalendarEvent} />
          {primaryCalendarEvent ? <CalendarTimelineCard timeline={primaryCalendarEvent.timeline} /> : null}
        </div>
      ) : null}

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
