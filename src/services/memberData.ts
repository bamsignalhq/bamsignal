import { STORAGE_KEYS } from "../constants/limits";
import type { ChatMessage, ChatThread, Match, ReportRecord, UserProfile } from "../types";
import { readJson, writeJson } from "../utils/storage";
import { apiUrl } from "./supabase";

type MemberIdentity = Pick<UserProfile, "email" | "phone" | "name">;

async function postMemberAction(action: string, identity: MemberIdentity, body: Record<string, unknown> = {}) {
  try {
    const response = await fetch(apiUrl(`/api/member/data?action=${action}`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...identity, ...body })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok) return null;
    return payload;
  } catch {
    return null;
  }
}

function mergeMatches(local: Match[], remote: Match[]): Match[] {
  const byId = new Map<string, Match>();
  for (const match of remote) byId.set(match.id, match);
  for (const match of local) byId.set(match.id, match);
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime()
  );
}

function mergeReports(local: ReportRecord[], remote: ReportRecord[]): ReportRecord[] {
  const key = (report: ReportRecord) => `${report.profileId}:${report.reason}:${report.at}`;
  const seen = new Set<string>();
  const merged: ReportRecord[] = [];
  for (const report of [...remote, ...local]) {
    const id = key(report);
    if (seen.has(id)) continue;
    seen.add(id);
    merged.push(report);
  }
  return merged;
}

function mergeChats(
  local: Record<string, ChatThread>,
  remote: Record<string, ChatThread>
): Record<string, ChatThread> {
  const next = { ...local };
  for (const [matchId, thread] of Object.entries(remote)) {
    const existing = next[matchId];
    if (!existing) {
      next[matchId] = thread;
      continue;
    }
    const byId = new Map<string, ChatMessage>();
    for (const message of [...existing.messages, ...thread.messages]) {
      byId.set(message.id, message);
    }
    next[matchId] = {
      ...existing,
      ...thread,
      messages: Array.from(byId.values()).sort(
        (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
      )
    };
  }
  return next;
}

export async function registerMember(user: MemberIdentity): Promise<void> {
  await postMemberAction("register", user);
}

export async function hydrateMemberData(user: MemberIdentity): Promise<void> {
  const payload = await postMemberAction("pull", user);
  const bundle = payload?.bundle;
  if (!bundle) return;

  const localMatches = readJson<Match[]>(STORAGE_KEYS.matches, []);
  const localReports = readJson<ReportRecord[]>(STORAGE_KEYS.reports, []);
  const localChats = readJson<Record<string, ChatThread>>(STORAGE_KEYS.chats, {});
  const localSignalsSent = readJson<number>(STORAGE_KEYS.signalsSent, 0);

  if (Array.isArray(bundle.matches) && bundle.matches.length) {
    writeJson(STORAGE_KEYS.matches, mergeMatches(localMatches, bundle.matches));
  }

  if (Array.isArray(bundle.reports) && bundle.reports.length) {
    writeJson(STORAGE_KEYS.reports, mergeReports(localReports, bundle.reports));
  }

  if (bundle.chats && typeof bundle.chats === "object") {
    writeJson(STORAGE_KEYS.chats, mergeChats(localChats, bundle.chats));
  }

  if (typeof bundle.signalsSent === "number" && bundle.signalsSent > localSignalsSent) {
    writeJson(STORAGE_KEYS.signalsSent, bundle.signalsSent);
  }

  const premiumUntil = bundle.user?.premium_until;
  if (premiumUntil && new Date(premiumUntil).getTime() > Date.now()) {
    localStorage.setItem(STORAGE_KEYS.premiumUntil, premiumUntil);
  }
}

export function persistSignalRemote(
  user: MemberIdentity,
  targetProfileId: string,
  signalType: "signal" | "priority" = "signal"
): void {
  void postMemberAction("signal", user, { targetProfileId, signalType });
}

export function persistMatchRemote(user: MemberIdentity, match: Match): void {
  void postMemberAction("match", user, { match });
}

export function persistMessageRemote(
  user: MemberIdentity,
  threadId: string,
  message: ChatMessage,
  threadMeta: Omit<ChatThread, "messages" | "matchId"> = {}
): void {
  void postMemberAction("message", user, { threadId, message, threadMeta });
}

export function persistReportRemote(user: MemberIdentity, report: ReportRecord): void {
  void postMemberAction("report", user, { report });
}
