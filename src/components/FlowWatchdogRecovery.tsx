type FlowWatchdogRecoveryProps = {
  onTryAgain: () => void;
  onContinueSafely?: () => void;
  showContinueSafely?: boolean;
};

export function FlowWatchdogRecovery({
  onTryAgain,
  onContinueSafely,
  showContinueSafely = false
}: FlowWatchdogRecoveryProps) {
  return (
    <div className="flow-watchdog-recovery" role="status">
      <p className="flow-watchdog-recovery__title">We&apos;re having trouble finishing this step.</p>
      <div className="flow-watchdog-recovery__actions">
        <button type="button" className="btn-primary btn-full" onClick={onTryAgain}>
          Try again
        </button>
        {showContinueSafely && onContinueSafely ? (
          <button type="button" className="btn-secondary btn-full" onClick={onContinueSafely}>
            Continue safely
          </button>
        ) : null}
      </div>
    </div>
  );
}
