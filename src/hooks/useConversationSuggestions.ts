import { useMemo } from "react";
import {
  buildConversationSuggestions,
  type ConversationProfile,
  type ConversationSuggestionsFutureConfig
} from "../utils/buildConversationSuggestions";

export type SmartConversationContext = "profile" | "match" | "chat" | "chat-empty" | "empty-inbox";

type UseConversationSuggestionsOptions = {
  viewer: ConversationProfile;
  target: ConversationProfile;
  context?: SmartConversationContext;
  limit?: number;
  enabled?: boolean;
  future?: ConversationSuggestionsFutureConfig;
};

export function useConversationSuggestions({
  viewer,
  target,
  context = "profile",
  limit,
  enabled = true,
  future
}: UseConversationSuggestionsOptions) {
  const seed = `${context}:${target.city ?? ""}:${(target.interests ?? []).join(",")}`;

  const suggestions = useMemo(() => {
    if (!enabled) return [];
    return buildConversationSuggestions(viewer, target, { limit, seed, future });
  }, [enabled, viewer, target, limit, seed, future]);

  return { suggestions, context };
}
