/** BamSignal Insights™ — knowledge and content ecosystem architecture. */

import { INSIGHTS_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const BAMSIGNAL_INSIGHTS_TITLE = "BamSignal Insights™";
export const BAMSIGNAL_INSIGHTS_SUBCOPY =
  "Perspectives and conversations — BamSignal's knowledge ecosystem for understanding relationships.";
export const PERSPECTIVES_LABEL = "Perspectives";
export const CONVERSATIONS_LABEL = "Conversations";

export const BAMSIGNAL_INSIGHTS_PURPOSE_COPY =
  "Prepare the knowledge and content ecosystem — insights first, never a blog or content feed.";
export const BAMSIGNAL_INSIGHTS_RESERVED_COPY =
  "Architecture prepared. Video series, books, and documentaries are not enabled yet.";

/** Reserved — never use in member-facing copy. */
export const BAMSIGNAL_INSIGHTS_AVOID_COPY = ["Blog", "Content Feed"] as const;

export { INSIGHTS_LABEL, UNDERSTANDING_RELATIONSHIPS_LABEL };

export type InsightContentPillarId =
  | "articles"
  | "podcasts"
  | "interviews"
  | "experts"
  | "family-stories"
  | "relationship-trends"
  | "faith-insights"
  | "diaspora-stories";

export type InsightContentPillarDefinition = {
  id: InsightContentPillarId;
  label: string;
  description: string;
};

export const INSIGHT_CONTENT_PILLARS: InsightContentPillarDefinition[] = [
  {
    id: "articles",
    label: "Articles",
    description: "Long-form perspectives — dignity-first, never a blog feed."
  },
  {
    id: "podcasts",
    label: "Podcasts",
    description: "Conversations on relationships — warm, human-first audio."
  },
  {
    id: "interviews",
    label: "Interviews",
    description: "Expert and member conversations — consent-first framing."
  },
  {
    id: "experts",
    label: "Experts",
    description: "Trusted voices — perspectives without popularity scoring."
  },
  {
    id: "family-stories",
    label: "Family stories",
    description: "Family journeys shared with care — never sensationalized."
  },
  {
    id: "relationship-trends",
    label: "Relationship trends",
    description: "Trends observed with dignity — not analytics dashboards."
  },
  {
    id: "faith-insights",
    label: "Faith insights",
    description: "Faith and relationships — respectful perspectives."
  },
  {
    id: "diaspora-stories",
    label: "Diaspora stories",
    description: "Diaspora families and corridors — Journey Across Borders."
  }
];

export type InsightArticleCategoryId =
  | "family-stories"
  | "relationship-trends"
  | "faith-insights"
  | "diaspora-stories"
  | "perspectives";

export type PreparedInsightArticleDefinition = {
  id: string;
  title: string;
  summary: string;
  categoryId: InsightArticleCategoryId;
  recordedAt: string;
};

export const PREPARED_INSIGHT_ARTICLES: PreparedInsightArticleDefinition[] = [
  {
    id: "bsi_article_family_values",
    title: "Family values across generations",
    summary: "Perspectives on family values — architecture preview, not published yet.",
    categoryId: "family-stories",
    recordedAt: "2026-04-01T00:00:00.000Z"
  },
  {
    id: "bsi_article_dating_intentions",
    title: "Relationship trends in Nigerian cities",
    summary: "Trends observed with care — never a content feed.",
    categoryId: "relationship-trends",
    recordedAt: "2026-04-15T00:00:00.000Z"
  },
  {
    id: "bsi_article_faith_marriage",
    title: "Faith and marriage pathways",
    summary: "Faith insights reserved — respectful framing first.",
    categoryId: "faith-insights",
    recordedAt: "2026-05-01T00:00:00.000Z"
  },
  {
    id: "bsi_article_diaspora_corridor",
    title: "Diaspora corridor conversations",
    summary: "Diaspora stories — Journey Across Borders with dignity.",
    categoryId: "diaspora-stories",
    recordedAt: "2026-05-15T00:00:00.000Z"
  }
];

export type PreparedPodcastDefinition = {
  id: string;
  title: string;
  summary: string;
  episodeCount: number;
  recordedAt: string;
};

export const PREPARED_PODCASTS: PreparedPodcastDefinition[] = [
  {
    id: "bsi_podcast_conversations",
    title: "Relationship Conversations",
    summary: "Warm conversations on understanding relationships — not a content feed.",
    episodeCount: 0,
    recordedAt: "2026-04-01T00:00:00.000Z"
  },
  {
    id: "bsi_podcast_diaspora",
    title: "Diaspora Dialogues",
    summary: "Diaspora families share perspectives — consent-first audio.",
    episodeCount: 0,
    recordedAt: "2026-05-01T00:00:00.000Z"
  }
];

export type PreparedInterviewDefinition = {
  id: string;
  title: string;
  summary: string;
  guestLabel: string;
  recordedAt: string;
};

export const PREPARED_INTERVIEWS: PreparedInterviewDefinition[] = [
  {
    id: "bsi_interview_couples",
    title: "Couples across corridors",
    summary: "Interview architecture prepared — dignity-first conversations.",
    guestLabel: "Reserved guest",
    recordedAt: "2026-04-10T00:00:00.000Z"
  },
  {
    id: "bsi_interview_faith_leaders",
    title: "Faith leaders on marriage",
    summary: "Perspectives on faith and relationships — not published yet.",
    guestLabel: "Reserved guest",
    recordedAt: "2026-05-10T00:00:00.000Z"
  }
];

export type PreparedExpertDefinition = {
  id: string;
  name: string;
  title: string;
  focus: string;
  recordedAt: string;
};

export const PREPARED_EXPERTS: PreparedExpertDefinition[] = [
  {
    id: "bsi_expert_relationship_counselor",
    name: "Reserved expert",
    title: "Relationship counselor",
    focus: "Communication and family values — perspectives without scoring.",
    recordedAt: "2026-04-01T00:00:00.000Z"
  },
  {
    id: "bsi_expert_diaspora_researcher",
    name: "Reserved expert",
    title: "Diaspora researcher",
    focus: "Diaspora families and corridors — insights with consent.",
    recordedAt: "2026-05-01T00:00:00.000Z"
  }
];

export type BamSignalInsightsFutureCapabilityId = "video-series" | "books" | "documentaries";

export const BAMSIGNAL_INSIGHTS_FUTURE_CAPABILITIES: {
  id: BamSignalInsightsFutureCapabilityId;
  label: string;
  description: string;
}[] = [
  {
    id: "video-series",
    label: "Video series",
    description: "Reserved — video series with dignity-first storytelling."
  },
  {
    id: "books",
    label: "Books",
    description: "Reserved — books on understanding relationships."
  },
  {
    id: "documentaries",
    label: "Documentaries",
    description: "Reserved — documentaries — never sensationalized."
  }
];

export function getInsightContentPillar(
  pillarId: InsightContentPillarId
): InsightContentPillarDefinition | undefined {
  return INSIGHT_CONTENT_PILLARS.find((pillar) => pillar.id === pillarId);
}

export function getInsightArticleCategoryLabel(categoryId: InsightArticleCategoryId): string {
  const labels: Record<InsightArticleCategoryId, string> = {
    "family-stories": "Family stories",
    "relationship-trends": "Relationship trends",
    "faith-insights": "Faith insights",
    "diaspora-stories": "Diaspora stories",
    perspectives: PERSPECTIVES_LABEL
  };
  return labels[categoryId];
}
