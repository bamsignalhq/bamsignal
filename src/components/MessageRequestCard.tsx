import type { LikeEntry } from "../types";

type MessageRequestCardProps = {
  entry: LikeEntry;
  onAccept: () => void;
  onIgnore: () => void;
  onDecline: () => void;
};

export function MessageRequestCard({ entry, onAccept, onIgnore, onDecline }: MessageRequestCardProps) {
  return (
    <article className="card message-request-card">
      <div className="message-request-card__main">
        {entry.photo ? <img src={entry.photo} alt="" className="message-request-card__photo" /> : null}
        <div>
          <strong>Message request</strong>
          <p>
            <strong>{entry.name}</strong> sent you a signal. Accept to start chatting.
          </p>
          <span className="message-request-card__meta">{entry.city}</span>
        </div>
      </div>
      <div className="message-request-card__actions">
        <button type="button" className="btn-secondary btn-sm" onClick={onIgnore}>
          Ignore
        </button>
        <button type="button" className="btn-secondary btn-sm" onClick={onDecline}>
          Decline
        </button>
        <button type="button" className="btn-primary btn-sm" onClick={onAccept}>
          Accept
        </button>
      </div>
    </article>
  );
}
