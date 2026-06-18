import { cardActivityBadge, isOnlineNow } from "./activity";
import { isDemoTypingMatch } from "./reviewerDemoChats";
import type { ChatMessage } from "../types";

export type ChatListStatusKind = "online" | "typing" | "seen" | "muted";

export type ChatListStatus = {
  text: string;
  kind: ChatListStatusKind;
  showOnlineDot: boolean;
};

function formatSeenAgo(iso: string): string {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 60) return `Seen ${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `Seen ${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  return "Seen recently";
}

export function chatListStatus(opts: {
  matchId: string;
  lastActiveAt?: string;
  lastMessage?: ChatMessage;
  peerSeenAt?: string;
  receiptsOn?: boolean;
}): ChatListStatus | null {
  const { matchId, lastActiveAt, lastMessage, peerSeenAt, receiptsOn = true } = opts;

  if (isDemoTypingMatch(matchId)) {
    return { text: "Typing...", kind: "typing", showOnlineDot: true };
  }

  if (lastActiveAt && isOnlineNow(lastActiveAt)) {
    return { text: "Online now", kind: "online", showOnlineDot: true };
  }

  if (receiptsOn && lastMessage?.from === "me" && peerSeenAt) {
    return { text: formatSeenAgo(peerSeenAt), kind: "seen", showOnlineDot: false };
  }

  const badge = lastActiveAt ? cardActivityBadge(lastActiveAt) : null;
  if (badge && !badge.online) {
    const label = badge.label === "Active now" ? "Online now" : badge.label;
    return { text: label, kind: "muted", showOnlineDot: false };
  }

  return null;
}

export function formatThreadTime(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

export function formatBubbleTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}
