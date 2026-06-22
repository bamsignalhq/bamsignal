/** Institutional Knowledge Base™ — central institutional memory architecture. */

import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const INSTITUTIONAL_KNOWLEDGE_BASE_TITLE = "Institutional Knowledge Base™";
export const INSTITUTIONAL_KNOWLEDGE_BASE_LABEL = "Institutional Knowledge";
export const KNOWLEDGE_CATEGORY_LABEL = "Knowledge Category";
export const KNOWLEDGE_ARTICLE_LABEL = "Knowledge Article";

export const INSTITUTIONAL_KNOWLEDGE_BASE_SUBCOPY =
  "Institutional Knowledge Base™ — central memory for mission, operations, consulting, research, communities, legacy, governance, and culture.";
export const INSTITUTIONAL_KNOWLEDGE_BASE_PURPOSE_COPY =
  "Knowledge lives across systems today — this architecture preserves lessons, principles, decisions, and culture in one institutional memory.";
export const INSTITUTIONAL_KNOWLEDGE_BASE_RESERVED_COPY =
  "Architecture prepared. Search, AI retrieval, and knowledge assistants are not enabled yet.";

export const INSTITUTIONAL_MEMORY_PURPOSES = [
  "Preserve lessons",
  "Preserve principles",
  "Preserve decisions",
  "Preserve culture"
] as const;

export { UNDERSTANDING_RELATIONSHIPS_LABEL };

export type KnowledgeCategoryId =
  | "mission"
  | "operations"
  | "consulting"
  | "research"
  | "communities"
  | "legacy"
  | "governance"
  | "culture";

export type KnowledgeCategoryDefinition = {
  id: KnowledgeCategoryId;
  title: string;
  description: string;
  categoryOrder: number;
};

export const KNOWLEDGE_CATEGORIES: KnowledgeCategoryDefinition[] = [
  {
    id: "mission",
    title: "Mission",
    description: "Why BamSignal exists — dignified discovery, never exploitation.",
    categoryOrder: 1
  },
  {
    id: "operations",
    title: "Operations",
    description: "How the institution runs — operations center patterns, not playbooks.",
    categoryOrder: 2
  },
  {
    id: "consulting",
    title: "Consulting",
    description: "Signal Concierge stewardship — human-first journey memory.",
    categoryOrder: 3
  },
  {
    id: "research",
    title: "Research",
    description: "House Institute inquiry — anonymous aggregates, never identities.",
    categoryOrder: 4
  },
  {
    id: "communities",
    title: "Communities",
    description: "City and corridor wisdom — community dignity preserved.",
    categoryOrder: 5
  },
  {
    id: "legacy",
    title: "Legacy",
    description: "Legacy families and archives — generational memory.",
    categoryOrder: 6
  },
  {
    id: "governance",
    title: "Governance",
    description: "Governance Framework and Stewardship Council architecture.",
    categoryOrder: 7
  },
  {
    id: "culture",
    title: "Culture",
    description: "Institutional culture — compact fintech dignity, never loud theatre.",
    categoryOrder: 8
  }
];

export type KnowledgeArticleId =
  | "mission-anchor"
  | "operations-center"
  | "consulting-stewardship"
  | "research-pipeline"
  | "community-dignity"
  | "legacy-archive"
  | "governance-pillars"
  | "culture-principles";

export type KnowledgeArticleDefinition = {
  id: KnowledgeArticleId;
  categoryId: KnowledgeCategoryId;
  title: string;
  summary: string;
  articleOrder: number;
};

export const KNOWLEDGE_ARTICLES: KnowledgeArticleDefinition[] = [
  {
    id: "mission-anchor",
    categoryId: "mission",
    title: "Mission anchor",
    summary: "BamSignal exists for dignified relationship discovery — architecture documented, not marketing slogans.",
    articleOrder: 1
  },
  {
    id: "operations-center",
    categoryId: "operations",
    title: "Operations memory",
    summary: "Operations center patterns — how institutional work is coordinated without chaos.",
    articleOrder: 2
  },
  {
    id: "consulting-stewardship",
    categoryId: "consulting",
    title: "Consulting stewardship",
    summary: "Concierge journeys are stewarded human-first — lessons preserved, never member identities.",
    articleOrder: 3
  },
  {
    id: "research-pipeline",
    categoryId: "research",
    title: "Research pipeline ethics",
    summary: "House Institute data flows as anonymous aggregates — research memory without private notes.",
    articleOrder: 4
  },
  {
    id: "community-dignity",
    categoryId: "communities",
    title: "Community dignity",
    summary: "Communities are partners — corridor and city wisdom, never leaderboard culture.",
    articleOrder: 5
  },
  {
    id: "legacy-archive",
    categoryId: "legacy",
    title: "Legacy archive",
    summary: "Legacy families inform long-horizon memory — archives prepared, not published identities.",
    articleOrder: 6
  },
  {
    id: "governance-pillars",
    categoryId: "governance",
    title: "Governance pillars",
    summary: "Governance Framework and Stewardship Council — institutional decisions documented only.",
    articleOrder: 7
  },
  {
    id: "culture-principles",
    categoryId: "culture",
    title: "Culture principles",
    summary: "Compact fintech dignity across member experience — culture preserved, not redesigned casually.",
    articleOrder: 8
  }
];

export type KnowledgeTimelineEntry = {
  id: string;
  label: string;
  recordedAt: string;
  note?: string;
};

export const KNOWLEDGE_TIMELINE_ENTRIES: KnowledgeTimelineEntry[] = [
  {
    id: "ikb_timeline_memory_prepared",
    label: "Institutional knowledge architecture prepared",
    recordedAt: "2026-03-01T00:00:00.000Z",
    note: "Eight categories documented — not search or AI retrieval."
  },
  {
    id: "ikb_timeline_articles_defined",
    label: "Knowledge articles framework defined",
    recordedAt: "2026-05-01T00:00:00.000Z",
    note: "Lessons, principles, decisions, and culture pathways reserved."
  },
  {
    id: "ikb_timeline_assistants_reserved",
    label: "Knowledge assistants pathway reserved",
    recordedAt: "2026-07-01T00:00:00.000Z",
    note: "AI retrieval documented for future readiness only."
  }
];

export const INSTITUTION_MEMORY_NARRATIVE =
  "Institutional memory unifies knowledge scattered across products, operations, research, and legacy — so future custodians inherit wisdom, not confusion.";

export const INSTITUTIONAL_KNOWLEDGE_FUTURE_MODULES = [
  {
    id: "search",
    label: "Search",
    description: "Institutional knowledge search — documented, not implemented."
  },
  {
    id: "ai-retrieval",
    label: "AI retrieval",
    description: "Semantic retrieval across institutional memory — architecture reserved."
  },
  {
    id: "knowledge-assistants",
    label: "Knowledge assistants",
    description: "AI knowledge assistants for stewards — not enabled yet."
  }
] as const;

export function getKnowledgeCategory(
  categoryId: KnowledgeCategoryId
): KnowledgeCategoryDefinition | undefined {
  return KNOWLEDGE_CATEGORIES.find((category) => category.id === categoryId);
}
