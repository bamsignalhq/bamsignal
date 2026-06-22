import { useMemo } from "react";
import { MEETING_NOTES_SYSTEM_BRAND } from "../../../constants/meetingNotes";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { ensureMemberMeetingNotesBundle } from "../../../utils/MeetingNotesEngine";
import { MeetingActionCard } from "./MeetingActionCard";
import { MeetingNoteCard } from "./MeetingNoteCard";
import { MeetingRecommendationsCard } from "./MeetingRecommendationsCard";
import { MeetingSummaryCard } from "./MeetingSummaryCard";
import { MeetingTimelineCard } from "./MeetingTimelineCard";

type MemberMeetingNotesSectionProps = {
  member: ConciergeMemberRecord;
};

export function MemberMeetingNotesSection({ member }: MemberMeetingNotesSectionProps) {
  const bundle = useMemo(() => ensureMemberMeetingNotesBundle(member), [member]);

  return (
    <section className="member-meeting-notes">
      <header className="member-meeting-notes__section-head cc-reveal">
        <h2>Meeting notes</h2>
        <p>
          {MEETING_NOTES_SYSTEM_BRAND} — private consultant-admin memory, never public.
        </p>
      </header>

      <MeetingSummaryCard summary={bundle.summary} />

      <div className="member-meeting-notes__cards">
        {bundle.notes.length > 0 ? (
          <div className="member-meeting-notes__history">
            <h3 className="member-meeting-notes__history-title">Meeting history</h3>
            <div className="member-meeting-notes__history-list">
              {bundle.notes.map((note) => (
                <MeetingNoteCard key={note.id} note={note} />
              ))}
            </div>
          </div>
        ) : null}
        <MeetingRecommendationsCard recommendations={bundle.recommendations} />
        <MeetingActionCard actionItems={bundle.actionItems} />
        <MeetingTimelineCard timeline={bundle.timeline} />
      </div>
    </section>
  );
}
