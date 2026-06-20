import { Zap } from "lucide-react";
import { FAST_CONNECTION_DAILY_SIGNALS } from "../utils/fastConnectionState";
import { fastConnectionActiveLabel, isQuickiePassActive } from "../utils/quickie";

type FastConnectionPageProps = {
  onDiscover: () => void;
  onHome: () => void;
};

export function FastConnectionPage({ onDiscover, onHome }: FastConnectionPageProps) {
  const active = isQuickiePassActive();
  const statusLabel = fastConnectionActiveLabel();

  return (
    <div className="page fast-connection-page">
      <header className="fast-connection-page__head">
        <div className="fast-connection-sheet__icon" aria-hidden>
          <Zap size={24} />
        </div>
        <h1>Fast Connection</h1>
        {statusLabel ? <p className="profile-fast-connection-status">{statusLabel}</p> : null}
      </header>

      {active ? (
        <>
          <p className="fast-connection-page__copy">
            You have access to the dedicated Fast Connection pool and {FAST_CONNECTION_DAILY_SIGNALS} Fast
            Signals every 24 hours.
          </p>
          <button type="button" className="btn-primary btn-full" onClick={onDiscover}>
            Open Discover
          </button>
        </>
      ) : (
        <>
          <p className="fast-connection-page__copy">Your Fast Connection pass is not active.</p>
          <button type="button" className="btn-secondary btn-full" onClick={onHome}>
            Back to Home
          </button>
        </>
      )}
    </div>
  );
}
