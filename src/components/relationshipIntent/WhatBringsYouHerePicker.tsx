import { Check } from "lucide-react";
import {
  MAX_RELATIONSHIP_INTENT_SELECTIONS,
  RELATIONSHIP_INTENT_LIMIT_MESSAGE,
  WHAT_BRINGS_YOU_HERE_HEADLINE,
  WHAT_BRINGS_YOU_HERE_OPTIONS,
  WHAT_BRINGS_YOU_HERE_SUBTEXT,
  relationshipIntentsFrom
} from "../../constants/relationshipIntent";
import type { IntentTag, RelationshipIntentId } from "../../types";
import { mergeRelationshipIntentSelection, toggleRelationshipIntentSelection } from "../../utils/relationshipIntent";

type WhatBringsYouHerePickerProps = {
  value: IntentTag[];
  onChange: (next: IntentTag[]) => void;
  onLimitMessage?: (message: string) => void;
  showHeader?: boolean;
  className?: string;
};

export function WhatBringsYouHerePicker({
  value,
  onChange,
  onLimitMessage,
  showHeader = true,
  className = ""
}: WhatBringsYouHerePickerProps) {
  const selected = relationshipIntentsFrom(value);

  const toggle = (intent: RelationshipIntentId) => {
    const result = toggleRelationshipIntentSelection(value, intent);
    if (result.blocked) {
      onLimitMessage?.(result.blockedReason || RELATIONSHIP_INTENT_LIMIT_MESSAGE);
      return;
    }
    onLimitMessage?.("");
    onChange(result.next);
  };

  return (
    <section className={`what-brings-you-here ${className}`.trim()}>
      {showHeader ? (
        <header className="what-brings-you-here__head">
          <h2 className="what-brings-you-here__title">{WHAT_BRINGS_YOU_HERE_HEADLINE}</h2>
          <p className="what-brings-you-here__sub">{WHAT_BRINGS_YOU_HERE_SUBTEXT}</p>
          <p className="what-brings-you-here__limit">
            Choose up to {MAX_RELATIONSHIP_INTENT_SELECTIONS}
          </p>
        </header>
      ) : null}

      <div className="what-brings-you-here__grid" role="group" aria-label={WHAT_BRINGS_YOU_HERE_HEADLINE}>
        {WHAT_BRINGS_YOU_HERE_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.id);
          const disabled =
            !isSelected && selected.length >= MAX_RELATIONSHIP_INTENT_SELECTIONS;

          return (
            <button
              key={option.id}
              type="button"
              className={`what-brings-you-here__card${isSelected ? " what-brings-you-here__card--selected" : ""}${
                disabled ? " what-brings-you-here__card--disabled" : ""
              }`}
              disabled={disabled}
              aria-pressed={isSelected}
              onClick={() => toggle(option.id)}
            >
              <span className="what-brings-you-here__emoji" aria-hidden>
                {option.emoji}
              </span>
              <span className="what-brings-you-here__label">{option.label}</span>
              {isSelected ? (
                <span className="what-brings-you-here__check" aria-hidden>
                  <Check size={14} strokeWidth={3} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function setRelationshipIntents(value: IntentTag[], nextRelationship: RelationshipIntentId[]): IntentTag[] {
  return mergeRelationshipIntentSelection(value, nextRelationship);
}
