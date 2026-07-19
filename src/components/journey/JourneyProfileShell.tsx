import type { ReactNode } from "react";
import {
  JOURNEY_PROFILE_GUIDE,
  JOURNEY_PROFILE_STRENGTH,
  JOURNEY_PROFILE_TRUST,
  type JourneyProfileScreenId
} from "../../constants/journeyProfile";
import { JourneyShell } from "./JourneyShell";

type JourneyProfileShellProps = {
  screen: JourneyProfileScreenId;
  onBack?: () => void;
  showBack?: boolean;
  transitionDirection?: "forward" | "back";
  guide?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function JourneyProfileShell({
  screen,
  onBack,
  showBack,
  transitionDirection = "forward",
  guide,
  children,
  footer
}: JourneyProfileShellProps) {
  const strength = JOURNEY_PROFILE_STRENGTH[screen];
  return (
    <JourneyShell
      chapter={strength.chapter}
      strengthFill={strength.fill}
      strengthLabel={strength.label}
      strengthHint={strength.hint}
      guide={guide !== undefined ? guide || undefined : JOURNEY_PROFILE_GUIDE[screen]}
      trust={JOURNEY_PROFILE_TRUST[screen]}
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
