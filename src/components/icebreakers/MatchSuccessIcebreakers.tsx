import type { DatingProfile, DiscoverProfile, Match } from "../../types";
import { SmartConversationSection } from "../conversation/SmartConversationSection";

type MatchSuccessIcebreakersProps = {
  open: boolean;
  matchName: string;
  viewer: DatingProfile;
  target: DiscoverProfile | DatingProfile;
  onSelect: (text: string) => void;
  onClose: () => void;
  onStartChat?: () => void;
};

export function MatchSuccessIcebreakers({
  open,
  matchName,
  viewer,
  target,
  onSelect,
  onClose,
  onStartChat
}: MatchSuccessIcebreakersProps) {
  if (!open) return null;

  return (
    <div className="match-success-sheet" role="dialog" aria-modal="true" aria-label="You connected">
      <button type="button" className="match-success-sheet__backdrop" onClick={onClose} aria-label="Close" />
      <article className="match-success-sheet__panel">
        <SmartConversationSection
          viewer={viewer}
          target={target}
          context="match"
          onSelect={onSelect}
          className="smart-conversation--match"
          showLede={false}
        />
        <p className="match-success-sheet__hint">
          Tap an idea to add it to your message to {matchName}. You can edit before sending.
        </p>
        {onStartChat ? (
          <button type="button" className="btn-primary btn-full" onClick={onStartChat}>
            Open chat
          </button>
        ) : (
          <button type="button" className="btn-secondary btn-full" onClick={onClose}>
            Continue
          </button>
        )}
      </article>
    </div>
  );
}

export type { Match };
