import type { IntentTag } from "../types";

export const INTENT_OPTIONS: {
  id: IntentTag;
  label: string;
  emoji: string;
}[] = [
  { id: "Relationship", label: "Relationship", emoji: "❤️" },
  { id: "Friendship", label: "Friendship", emoji: "🤝" },
  { id: "Networking", label: "Networking", emoji: "🌍" },
  { id: "Social Events", label: "Social Events", emoji: "🎉" },
  { id: "Chat", label: "Chat", emoji: "💬" },
  { id: "Quickie", label: "Quickie", emoji: "🔥" }
];

export const MAX_INTENT_SELECTIONS = 2;

export function intentLabel(id: IntentTag): string {
  return INTENT_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

export function intentDisplay(id: IntentTag): string {
  const opt = INTENT_OPTIONS.find((o) => o.id === id);
  return opt ? `${opt.emoji} ${opt.label}` : id;
}

/** Profile read view — no emoji, high-contrast outdoor readability */
export function profileIntentLabel(id: IntentTag): string {
  if (id === "Relationship") return "Serious Relationship";
  return intentLabel(id);
}

/** Map legacy intent values from older saves */
export function normalizeIntent(raw: string): IntentTag | null {
  const map: Record<string, IntentTag> = {
    Dating: "Relationship",
    Serious: "Relationship",
    Fun: "Social Events",
    Friendship: "Friendship",
    Networking: "Networking",
    Relationship: "Relationship",
    "Social Events": "Social Events",
    Chat: "Chat",
    Quickie: "Quickie"
  };
  return map[raw] ?? null;
}

export function normalizeIntents(raw: string[] | undefined): IntentTag[] {
  if (!raw?.length) return ["Relationship"];
  const out = raw.map(normalizeIntent).filter(Boolean) as IntentTag[];
  const unique = [...new Set(out)].slice(0, MAX_INTENT_SELECTIONS);
  return unique.length ? unique : ["Relationship"];
}
