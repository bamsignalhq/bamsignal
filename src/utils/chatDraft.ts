const CHAT_DRAFT_KEY = "bamsignal_pending_chat_draft";
const CHAT_OPEN_KEY = "bamsignal_pending_chat_open";

type PendingChatDraft = {
  matchId: string;
  draft: string;
};

export function setPendingChatDraft(matchId: string, draft: string): void {
  try {
    sessionStorage.setItem(CHAT_DRAFT_KEY, JSON.stringify({ matchId, draft }));
  } catch {
    // ignore storage failures
  }
}

export function consumePendingChatDraft(matchId: string): string | null {
  try {
    const raw = sessionStorage.getItem(CHAT_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingChatDraft;
    if (parsed.matchId !== matchId || !parsed.draft?.trim()) return null;
    sessionStorage.removeItem(CHAT_DRAFT_KEY);
    return parsed.draft;
  } catch {
    return null;
  }
}

export function setPendingChatOpen(matchId: string): void {
  try {
    sessionStorage.setItem(CHAT_OPEN_KEY, matchId);
  } catch {
    // ignore storage failures
  }
}

export function consumePendingChatOpen(): string | null {
  try {
    const matchId = sessionStorage.getItem(CHAT_OPEN_KEY);
    if (!matchId) return null;
    sessionStorage.removeItem(CHAT_OPEN_KEY);
    return matchId;
  } catch {
    return null;
  }
}

export function copyIcebreaker(text: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return Promise.resolve(false);
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
}
