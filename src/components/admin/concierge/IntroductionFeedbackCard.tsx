import { useState } from "react";
import type { IntroductionFeedbackEntry } from "../../../types/conciergeIntroduction";
import { addIntroductionFeedback } from "../../../utils/IntroductionEngine";

type IntroductionFeedbackCardProps = {
  recordId: string;
  feedback: IntroductionFeedbackEntry[];
  onUpdated: () => void;
};

export function IntroductionFeedbackCard({
  recordId,
  feedback,
  onUpdated
}: IntroductionFeedbackCardProps) {
  const [body, setBody] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");

  const handleSubmit = () => {
    if (!body.trim()) return;
    addIntroductionFeedback(recordId, {
      author: "consultant",
      body: body.trim(),
      followUpNotes: followUpNotes.trim() || undefined
    });
    setBody("");
    setFollowUpNotes("");
    onUpdated();
  };

  return (
    <section className="introduction-feedback concierge-consultant-card">
      <header className="concierge-consultant-card__head">
        <h3>Feedback</h3>
        <p>Private consultant notes on this introduction journey.</p>
      </header>

      <div className="introduction-feedback__form">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="How did the conversation feel? What should we note for follow-up?"
          rows={3}
        />
        <input
          value={followUpNotes}
          onChange={(event) => setFollowUpNotes(event.target.value)}
          placeholder="Follow-up notes"
        />
        <button type="button" className="concierge-consultant-btn" onClick={handleSubmit} disabled={!body.trim()}>
          Save feedback
        </button>
      </div>

      {feedback.length ? (
        <ul className="introduction-feedback__list">
          {feedback.map((entry) => (
            <li key={entry.id}>
              <p>{entry.body}</p>
              {entry.followUpNotes ? <p className="introduction-feedback__follow-up">{entry.followUpNotes}</p> : null}
              <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      ) : (
        <p className="concierge-consultant__empty">No feedback recorded yet.</p>
      )}
    </section>
  );
}
