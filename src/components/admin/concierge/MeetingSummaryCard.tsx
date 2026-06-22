import { MEETING_NOTE_PRIVACY_COPY } from "../../../constants/meetingNotes";
import type { MeetingSummary } from "../../../types/meetingNotes";

type MeetingSummaryCardProps = {
  summary: MeetingSummary;
};

export function MeetingSummaryCard({ summary }: MeetingSummaryCardProps) {
  return (
    <section className="meeting-summary-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Meeting memory</h3>
        <p>{MEETING_NOTE_PRIVACY_COPY}</p>
      </header>
      <dl className="meeting-summary-card__grid">
        <div>
          <dt>Meeting notes</dt>
          <dd>{summary.totalNotes}</dd>
        </div>
        <div>
          <dt>Recommendations</dt>
          <dd>{summary.totalRecommendations}</dd>
        </div>
        <div>
          <dt>Open action items</dt>
          <dd>{summary.openActionItems}</dd>
        </div>
        {summary.latestNoteAt ? (
          <div>
            <dt>Latest meeting</dt>
            <dd>
              <time dateTime={summary.latestNoteAt}>
                {new Date(summary.latestNoteAt).toLocaleString()}
              </time>
            </dd>
          </div>
        ) : null}
      </dl>
      <p className="meeting-summary-card__narrative">{summary.narrative}</p>
    </section>
  );
}
