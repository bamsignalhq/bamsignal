import { useState } from "react";
import { INTRODUCTION_FEEDBACK_CATEGORIES, type IntroductionFeedbackCategory } from "../../../constants/conciergeIntroduction";
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
  const [category, setCategory] = useState<IntroductionFeedbackCategory>("positive");
  const [followUpNotes, setFollowUpNotes] = useState("");

  const handleSubmit = () => {
    if (!body.trim()) return;
    addIntroductionFeedback(recordId, {
      author: "consultant",
      body: body.trim(),
      category,
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
        <p>Private consultant notes on this Introduction journey.</p>
      </header>

      <div className="introduction-feedback__form">
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value as IntroductionFeedbackCategory)}>
            {INTRODUCTION_FEEDBACK_CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
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
              {entry.category ? (
                <span className="introduction-feedback__category">
                  {INTRODUCTION_FEEDBACK_CATEGORIES.find((item) => item.id === entry.category)?.label ??
                    entry.category}
                </span>
              ) : null}
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
