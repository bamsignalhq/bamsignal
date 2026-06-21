import {
  MATCH_CONVERSATION_EYEBROW,
  MATCH_CONVERSATION_SUGGESTIONS,
  MAX_CONVERSATION_SUGGESTIONS,
  SMART_CONVERSATION_HINT,
  SMART_CONVERSATION_LEDE,
  SMART_CONVERSATION_TITLE,
  type ConversationProfile
} from "../../utils/buildConversationSuggestions";
import {
  useConversationSuggestions,
  type SmartConversationContext
} from "../../hooks/useConversationSuggestions";
import { ConversationSuggestionChip } from "./ConversationSuggestionChip";

type SmartConversationSectionProps = {
  viewer: ConversationProfile;
  target: ConversationProfile;
  context?: SmartConversationContext;
  messageCount?: number;
  limit?: number;
  onSelect: (text: string) => void;
  className?: string;
  showLede?: boolean;
};

function defaultLimit(context: SmartConversationContext): number {
  if (context === "match") return MATCH_CONVERSATION_SUGGESTIONS;
  return MAX_CONVERSATION_SUGGESTIONS;
}

export function SmartConversationSection({
  viewer,
  target,
  context = "profile",
  messageCount = 0,
  limit,
  onSelect,
  className = "",
  showLede = true
}: SmartConversationSectionProps) {
  const resolvedLimit = limit ?? defaultLimit(context);
  const { suggestions } = useConversationSuggestions({
    viewer,
    target,
    context,
    limit: resolvedLimit,
    enabled: context !== "chat" || messageCount < 10
  });

  if (!suggestions.length) return null;

  const eyebrow = context === "match" ? MATCH_CONVERSATION_EYEBROW : null;
  const hint =
    context === "chat-empty" || context === "empty-inbox" ? SMART_CONVERSATION_HINT : null;

  return (
    <section
      className={`smart-conversation ${className}`.trim()}
      aria-label={SMART_CONVERSATION_TITLE}
    >
      {eyebrow ? <p className="smart-conversation__eyebrow">{eyebrow}</p> : null}
      <h3 className="smart-conversation__title">{SMART_CONVERSATION_TITLE}</h3>
      {hint ? <p className="smart-conversation__hint">{hint}</p> : null}
      {showLede && context === "profile" ? (
        <p className="smart-conversation__lede">{SMART_CONVERSATION_LEDE}</p>
      ) : null}
      <div className="smart-conversation__track" role="list">
        {suggestions.map((suggestion, index) => (
          <ConversationSuggestionChip
            key={suggestion.id}
            suggestion={suggestion}
            onSelect={onSelect}
            staggerIndex={index}
          />
        ))}
      </div>
    </section>
  );
}
