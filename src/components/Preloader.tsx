import { Loader2 } from "lucide-react";
import { BRAND } from "../constants/copy";
import { BRAND_ASSETS } from "../constants/brand";
import { SignalRipple } from "./signals/SignalRipple";

type PreloaderProps = {
  exiting?: boolean;
  subtitle?: string;
  variant?: "boot" | "minimal";
  showReload?: boolean;
  showRetry?: boolean;
  showSignOut?: boolean;
  onReload?: () => void;
  onRetry?: () => void;
  onSignOut?: () => void;
};

export function Preloader({
  exiting = false,
  subtitle,
  variant = "boot",
  showReload,
  showRetry,
  showSignOut,
  onReload,
  onRetry,
  onSignOut
}: PreloaderProps) {
  const minimal = variant === "minimal";

  return (
    <main
      className={`preloader ${minimal ? "preloader--minimal" : ""} ${exiting ? "preloader--exit" : ""}`}
      aria-label="Loading BamSignal"
    >
      {!minimal ? <div className="preloader__gradient" /> : null}
      <div className="preloader__core">
        {!minimal ? <SignalRipple active /> : null}
        {minimal ? (
          <Loader2 size={22} className="preloader__spinner" aria-hidden />
        ) : (
          <img src={BRAND_ASSETS.logo} alt="" className="preloader__logo" width={112} height={112} />
        )}
      </div>
      <h1 className="preloader__title">{BRAND.name}</h1>
      {subtitle ? <p className="preloader__status">{subtitle}</p> : null}
      {showReload ? (
        <button type="button" className="btn-secondary preloader__reload" onClick={onReload}>
          Taking too long — tap to reload
        </button>
      ) : null}
      {showRetry ? (
        <button type="button" className="btn-secondary preloader__reload" onClick={onRetry}>
          Retry
        </button>
      ) : null}
      {showSignOut ? (
        <button type="button" className="preloader__signout" onClick={onSignOut}>
          Sign out
        </button>
      ) : null}
    </main>
  );
}

/** @deprecated use Preloader — kept for Capacitor native splash */
export function SplashScreen({ visible = true }: { visible?: boolean }) {
  if (!visible) return null;
  return <Preloader />;
}
