type MemberErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  onSupport?: () => void;
  supportLabel?: string;
};

export function MemberErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  onSupport,
  supportLabel = "Contact support"
}: MemberErrorStateProps) {
  return (
    <div className="member-error-state" role="alert">
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="member-error-state__actions">
        {onRetry ? (
          <button type="button" className="btn-primary" onClick={onRetry}>
            {retryLabel}
          </button>
        ) : null}
        {onSupport ? (
          <button type="button" className="btn-secondary" onClick={onSupport}>
            {supportLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
