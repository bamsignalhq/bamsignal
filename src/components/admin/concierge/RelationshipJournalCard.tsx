import { useState } from "react";
import { RELATIONSHIP_JOURNAL_EXAMPLES, RELATIONSHIP_JOURNAL_TITLE } from "../../../constants/relationshipFollowUp";
import type { RelationshipFollowUpRecord } from "../../../types/relationshipFollowUp";
import { addRelationshipJournalEntry } from "../../../utils/RelationshipFollowUpEngine";

type RelationshipJournalCardProps = {
  record: RelationshipFollowUpRecord;
  onUpdated: () => void;
};

export function RelationshipJournalCard({ record, onUpdated }: RelationshipJournalCardProps) {
  const [body, setBody] = useState("");

  const handleSubmit = () => {
    if (!body.trim()) return;
    addRelationshipJournalEntry(record.id, body.trim());
    setBody("");
    onUpdated();
  };

  return (
    <section className="relationship-journal concierge-consultant-card--glass">
      <header className="concierge-consultant-card__head">
        <h3>{RELATIONSHIP_JOURNAL_TITLE}</h3>
        <p>Private — consultant-only.</p>
      </header>
      <div className="concierge-private-notes__examples">
        {RELATIONSHIP_JOURNAL_EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            className="concierge-private-notes__chip"
            onClick={() => setBody(example)}
          >
            {example}
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Private notes on this journey…"
        rows={3}
        className="relationship-journal__input"
      />
      <button type="button" className="concierge-consultant-btn" onClick={handleSubmit} disabled={!body.trim()}>
        Save journal entry
      </button>
      {record.journal.length ? (
        <ul className="relationship-journal__list">
          {record.journal.map((entry) => (
            <li key={entry.id}>
              <p>{entry.body}</p>
              <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
