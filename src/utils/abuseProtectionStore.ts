import {
  ABUSE_BLOCK_SEED,
  ABUSE_LIST_ENTRIES_SEED,
  ABUSE_RATE_LIMIT_SEED
} from "../data/abuseProtectionSeed";
import type { AbuseBlockRecord, AbuseRateLimitRule } from "../types/abuseProtection";
import { adjustAbuseRateLimit } from "./abuseProtectionLogic";

const STORAGE_KEY = "bamsignal.abuseProtectionCenter.v1";

type ListEntry = (typeof ABUSE_LIST_ENTRIES_SEED)[number];

type AbuseProtectionStoreState = {
  blocks: AbuseBlockRecord[];
  rateLimits: AbuseRateLimitRule[];
  listEntries: ListEntry[];
  updatedAt: string;
};

function readState(): AbuseProtectionStoreState {
  if (typeof window === "undefined") {
    return {
      blocks: [...ABUSE_BLOCK_SEED],
      rateLimits: [...ABUSE_RATE_LIMIT_SEED],
      listEntries: [...ABUSE_LIST_ENTRIES_SEED],
      updatedAt: new Date().toISOString()
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        blocks: [...ABUSE_BLOCK_SEED],
        rateLimits: [...ABUSE_RATE_LIMIT_SEED],
        listEntries: [...ABUSE_LIST_ENTRIES_SEED],
        updatedAt: new Date().toISOString()
      };
    }
    const parsed = JSON.parse(raw) as AbuseProtectionStoreState;
    return {
      blocks: Array.isArray(parsed.blocks) ? parsed.blocks : [...ABUSE_BLOCK_SEED],
      rateLimits: Array.isArray(parsed.rateLimits) ? parsed.rateLimits : [...ABUSE_RATE_LIMIT_SEED],
      listEntries: Array.isArray(parsed.listEntries) ? parsed.listEntries : [...ABUSE_LIST_ENTRIES_SEED],
      updatedAt: parsed.updatedAt ?? new Date().toISOString()
    };
  } catch {
    return {
      blocks: [...ABUSE_BLOCK_SEED],
      rateLimits: [...ABUSE_RATE_LIMIT_SEED],
      listEntries: [...ABUSE_LIST_ENTRIES_SEED],
      updatedAt: new Date().toISOString()
    };
  }
}

function writeState(state: AbuseProtectionStoreState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function listAbuseBlocks(): AbuseBlockRecord[] {
  return readState().blocks;
}

export function listAbuseRateLimits(): AbuseRateLimitRule[] {
  return readState().rateLimits;
}

export function listAbuseListEntries(): ListEntry[] {
  return readState().listEntries;
}

export function applyAbuseProtectionAction(input: {
  tool: "unblock" | "blacklist" | "whitelist" | "increase-limits" | "decrease-limits" | "manual-review";
  targetId: string;
  actor: string;
}): void {
  const state = readState();

  if (input.tool === "unblock") {
    state.blocks = state.blocks.filter((item) => item.id !== input.targetId);
  }

  if (input.tool === "blacklist") {
    const block = state.blocks.find((item) => item.id === input.targetId);
    if (block) {
      state.listEntries = [
        ...state.listEntries.filter((item) => item.target !== block.target),
        {
          id: `list_${Date.now()}`,
          listType: "blacklist",
          target: block.target,
          targetType: block.targetType,
          addedAt: new Date().toISOString(),
          addedBy: input.actor
        }
      ];
      state.blocks = state.blocks.filter((item) => item.id !== input.targetId);
    }
  }

  if (input.tool === "whitelist") {
    const block = state.blocks.find((item) => item.id === input.targetId);
    if (block) {
      state.listEntries = [
        ...state.listEntries.filter((item) => item.target !== block.target),
        {
          id: `list_${Date.now()}`,
          listType: "whitelist",
          target: block.target,
          targetType: block.targetType,
          addedAt: new Date().toISOString(),
          addedBy: input.actor
        }
      ];
      state.blocks = state.blocks.filter((item) => item.id !== input.targetId);
    }
  }

  if (input.tool === "increase-limits" || input.tool === "decrease-limits") {
    const direction = input.tool === "increase-limits" ? "increase" : "decrease";
    state.rateLimits = state.rateLimits.map((rule) =>
      rule.id === input.targetId ? adjustAbuseRateLimit(rule, direction) : rule
    );
  }

  writeState({ ...state, updatedAt: new Date().toISOString() });
}
