import {
  profileRelationshipIntentLabel,
  relationshipIntentsFrom
} from "../../constants/relationshipIntent";
import type { IntentTag } from "../../types";

type RelationshipIntentChipsProps = {
  intents: IntentTag[] | undefined;
  variant?: "hero" | "discover" | "profile";
  className?: string;
  max?: number;
};

export function RelationshipIntentChips({
  intents,
  variant = "discover",
  className = "",
  max = 2
}: RelationshipIntentChipsProps) {
  const relationship = relationshipIntentsFrom(intents).slice(0, max);
  if (!relationship.length) return null;

  return (
    <div
      className={`relationship-intent-chips relationship-intent-chips--${variant} ${className}`.trim()}
      aria-label="What brings them here"
    >
      {relationship.map((intent) => (
        <span key={intent} className="relationship-intent-chips__chip" title={profileRelationshipIntentLabel(intent)}>
          {profileRelationshipIntentLabel(intent)}
        </span>
      ))}
    </div>
  );
}
