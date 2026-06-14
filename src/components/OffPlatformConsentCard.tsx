type OffPlatformConsentCardProps = {
  matchName: string;
  onAccept: () => void;
  onDecline: () => void;
};

export function OffPlatformConsentCard({ matchName, onAccept, onDecline }: OffPlatformConsentCardProps) {
  return (
    <aside className="off-platform-consent card" role="status">
      <p>
        <strong>{matchName}</strong> wants to continue outside BamSignal (Telegram, social, etc.).
      </p>
      <p className="off-platform-consent__sub">Only say yes if you're comfortable leaving the app.</p>
      <div className="off-platform-consent__actions">
        <button type="button" className="btn-secondary btn-sm" onClick={onDecline}>
          No, keep it here
        </button>
        <button type="button" className="btn-primary btn-sm" onClick={onAccept}>
          Yes, I'm OK with that
        </button>
      </div>
    </aside>
  );
}
