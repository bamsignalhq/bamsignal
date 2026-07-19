import { ArrowLeft } from "lucide-react";

type JourneyHeaderProps = {
  onBack?: () => void;
  showBack?: boolean;
};

export function JourneyHeader({ onBack, showBack }: JourneyHeaderProps) {
  return (
    <header className="journey-header">
      {showBack && onBack ? (
        <button type="button" className="journey-header__back" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
      ) : (
        <span className="journey-header__spacer" aria-hidden />
      )}
      <span className="journey-header__brand">BamSignal</span>
      <span className="journey-header__spacer" aria-hidden />
    </header>
  );
}
