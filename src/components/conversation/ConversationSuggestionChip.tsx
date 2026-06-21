import type { ConversationSuggestion } from "../../utils/buildConversationSuggestions";

type ConversationSuggestionChipProps = {
  suggestion: ConversationSuggestion;
  onSelect: (text: string) => void;
  staggerIndex?: number;
};

export function ConversationSuggestionChip({
  suggestion,
  onSelect,
  staggerIndex = 0
}: ConversationSuggestionChipProps) {
  return (
    <button
      type="button"
      className="conversation-suggestion-chip"
      style={{ animationDelay: `${staggerIndex * 45}ms` }}
      onClick={() => onSelect(suggestion.text)}
    >
      {suggestion.text}
    </button>
  );
}
