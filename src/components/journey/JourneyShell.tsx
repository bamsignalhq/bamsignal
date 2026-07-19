import type { ReactNode } from "react";
import type { JourneyChapter } from "../../types/journey";
import { JourneyHeader } from "./JourneyHeader";
import { JourneyStrengthMeter } from "./JourneyStrengthMeter";
import { JourneyGuide } from "./JourneyGuide";
import { JourneyTrustHint } from "./JourneyTrustHint";
import { JourneyFooter } from "./JourneyFooter";

type JourneyShellProps = {
  chapter: JourneyChapter;
  strengthFill: number;
  strengthLabel: string;
  strengthHint: string;
  guide?: string;
  trust?: string;
  onBack?: () => void;
  showBack?: boolean;
  transitionKey?: string;
  transitionDirection?: "forward" | "back";
  children: ReactNode;
  footer?: ReactNode;
};

export function JourneyShell({
  chapter,
  strengthFill,
  strengthLabel,
  strengthHint,
  guide,
  trust,
  onBack,
  showBack,
  transitionKey,
  transitionDirection = "forward",
  children,
  footer
}: JourneyShellProps) {
  const enterClass =
    transitionDirection === "back" ? "journey-enter journey-enter--back" : "journey-enter journey-enter--forward";

  return (
    <div className={`journey-page journey-page--${chapter}`}>
      <div className="journey-shell">
        <div className="journey-shell__atmosphere" aria-hidden />
        <JourneyHeader onBack={onBack} showBack={showBack} />
        <JourneyStrengthMeter fill={strengthFill} label={strengthLabel} hint={strengthHint} />
        {guide ? <JourneyGuide text={guide} /> : null}
        <main key={transitionKey} className={`journey-shell__main ${enterClass}`}>
          {children}
        </main>
        {trust ? <JourneyTrustHint text={trust} /> : null}
        {footer ? <JourneyFooter>{footer}</JourneyFooter> : null}
      </div>
    </div>
  );
}
