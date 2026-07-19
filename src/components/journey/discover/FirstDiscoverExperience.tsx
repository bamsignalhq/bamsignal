import { JourneyCelebration, JourneyPrimaryButton, JourneyQuestion } from "..";
import { JourneyShell } from "../JourneyShell";

type DiscoverIntroProps = {
  firstName?: string;
  onMeetSomeone: () => void;
};

/** D0a — one screen before the Discover feed. */
export function DiscoverIntro({ firstName, onMeetSomeone }: DiscoverIntroProps) {
  const greeting = firstName?.trim() ? `Welcome, ${firstName.trim()}.` : "Welcome.";
  return (
    <JourneyShell
      chapter="ready"
      strengthFill={100}
      strengthLabel="Ready to connect"
      strengthHint=""
      guide="Ready?"
      trust="You're in control. Nothing is shared until you choose."
      transitionKey="d0a-intro"
      footer={
        <JourneyPrimaryButton onClick={onMeetSomeone}>Meet someone</JourneyPrimaryButton>
      }
    >
      <JourneyQuestion title={greeting}>
        <p className="journey-question__lede">
          Today we&apos;ll introduce you to a few amazing people.
        </p>
        <p className="journey-question__helper">
          Take your time. Every Signal starts a story.
        </p>
      </JourneyQuestion>
    </JourneyShell>
  );
}

type FirstDiscoverTipProps = {
  onDismiss: () => void;
};

/** Soft D0b tip above the first profiles — not a modal tutorial. */
export function FirstDiscoverTip({ onDismiss }: FirstDiscoverTipProps) {
  return (
    <div className="journey-discover-tip" role="status">
      <p className="journey-discover-tip__body">
        A Signal is interest — nothing starts a conversation until you choose.
      </p>
      <button type="button" className="journey-discover-tip__dismiss" onClick={onDismiss}>
        Got it
      </button>
    </div>
  );
}

type FirstSignalCelebrationProps = {
  onKeepExploring: () => void;
};

/** D1 — restrained first Signal celebration. */
export function FirstSignalCelebration({ onKeepExploring }: FirstSignalCelebrationProps) {
  return (
    <div className="journey-discover-celebrate" role="dialog" aria-modal="true" aria-label="First Signal">
      <div className="journey-discover-celebrate__card">
        <JourneyCelebration message="Your first Signal is on its way." />
        <p className="journey-question__lede journey-discover-celebrate__lede">
          Let&apos;s see where your story begins.
        </p>
        <JourneyPrimaryButton onClick={onKeepExploring}>Keep exploring</JourneyPrimaryButton>
      </div>
    </div>
  );
}
