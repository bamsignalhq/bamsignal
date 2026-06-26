import { Preloader } from "./Preloader";
import { InlineRestoreIndicator } from "./InlineRestoreIndicator";
import { useSessionRestoreUi } from "../hooks/useSessionRestoreUi";

type SessionRestoreOverlayProps = {
  active: boolean;
  subtitle?: string;
  onRetry?: () => void;
  onSignOut?: () => void;
};

export function SessionRestoreOverlay({
  active,
  subtitle = "Restoring your session…",
  onRetry,
  onSignOut
}: SessionRestoreOverlayProps) {
  const { phase, showInline, showMinimal, showStalledActions } = useSessionRestoreUi(active);

  if (!active || phase === "idle" || phase === "instant") {
    return null;
  }

  if (showInline) {
    return (
      <div className="session-restore-inline" aria-hidden={false}>
        <InlineRestoreIndicator label={subtitle} />
      </div>
    );
  }

  if (showMinimal) {
    return (
      <div className="session-restore-overlay" role="status" aria-live="polite">
        <Preloader
          variant="minimal"
          subtitle={showStalledActions ? "Still restoring your session…" : subtitle}
          showRetry={showStalledActions}
          showSignOut={showStalledActions}
          onRetry={onRetry}
          onSignOut={onSignOut}
        />
      </div>
    );
  }

  return null;
}
