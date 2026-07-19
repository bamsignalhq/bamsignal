import { JourneyCelebration } from "../JourneyCelebration";
import { JourneyQuestion } from "../JourneyQuestion";
import { JourneyAuthShell } from "../JourneyAuthShell";

type JourneySecureReadyProps = {
  firstName?: string;
};

/** Micro-pause between J6 and account creation — celebration, not a loader. */
export function JourneySecureReady({ firstName }: JourneySecureReadyProps) {
  const greeting = firstName?.trim() ? `${firstName.trim()}, you're ready.` : "You're ready.";
  return (
    <JourneyAuthShell screen="j6-ready" transitionDirection="forward">
      <JourneyQuestion title={greeting}>
        <p className="journey-question__lede">You&apos;ve come this far.</p>
        <JourneyCelebration message="Now let's protect it." />
      </JourneyQuestion>
    </JourneyAuthShell>
  );
}
