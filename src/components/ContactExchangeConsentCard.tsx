type ContactExchangeConsentCardProps = {
  requesterFirstName: string;
  onAccept: () => void;
  onDecline: () => void;
};

export function ContactExchangeConsentCard({
  requesterFirstName,
  onAccept,
  onDecline
}: ContactExchangeConsentCardProps) {
  return (
    <aside className="off-platform-consent card contact-exchange-consent" role="status">
      <p>
        <strong>{requesterFirstName}</strong> would like to continue outside BamSignal.
      </p>
      <div className="off-platform-consent__actions">
        <button type="button" className="btn-secondary btn-sm" onClick={onDecline}>
          Not yet
        </button>
        <button type="button" className="btn-primary btn-sm" onClick={onAccept}>
          Accept
        </button>
      </div>
    </aside>
  );
}
