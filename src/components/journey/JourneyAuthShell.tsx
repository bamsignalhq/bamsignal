import type { ReactNode } from "react";
import {
  JOURNEY_SECURE_GUIDE,
  JOURNEY_SECURE_STRENGTH,
  JOURNEY_SECURE_TRUST,
  type JourneyAuthScreenId
} from "../../constants/journeySecure";
import { JourneyShell } from "./JourneyShell";

type JourneyAuthShellProps = {
  screen: JourneyAuthScreenId;
  onBack?: () => void;
  showBack?: boolean;
  transitionDirection?: "forward" | "back";
  children: ReactNode;
  footer?: ReactNode;
};

export function JourneyAuthShell({
  screen,
  onBack,
  showBack,
  transitionDirection = "forward",
  children,
  footer
}: JourneyAuthShellProps) {
  const strength = JOURNEY_SECURE_STRENGTH[screen];
  return (
    <JourneyShell
      chapter="secure"
      strengthFill={strength.fill}
      strengthLabel={strength.label}
      strengthHint={strength.hint}
      guide={JOURNEY_SECURE_GUIDE[screen]}
      trust={JOURNEY_SECURE_TRUST[screen]}
      onBack={onBack}
      showBack={showBack}
      transitionKey={screen}
      transitionDirection={transitionDirection}
      footer={footer}
    >
      {children}
    </JourneyShell>
  );
}
