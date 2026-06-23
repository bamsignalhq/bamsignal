import type {
  SupportTicketPriorityId,
  SupportTicketStatusId,
  SupportTicketTypeId,
  SupportMetricId
} from "../constants/supportCenter";

/** @deprecated Use SupportTicketTypeId */
export type SupportTicketCategoryId = SupportTicketTypeId;

export type TicketTimelineEvent = {
  id: string;
  at: string;
  label: string;
  detail: string;
  actor: string;
};

export type SupportTicketRecord = {
  id: string;
  ticketNumber: string;
  subject: string;
  typeId: SupportTicketTypeId;
  /** @deprecated Use typeId */
  categoryId?: SupportTicketTypeId;
  status: SupportTicketStatusId;
  priority: SupportTicketPriorityId;
  escalated: boolean;
  memberUsername: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  assignedTo: string;
  note: string;
  timeline: TicketTimelineEvent[];
  satisfactionScore: number | null;
};

export type KnowledgeBaseArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  typeId: SupportTicketTypeId;
  /** @deprecated Use typeId */
  categoryId?: SupportTicketTypeId;
  href?: string;
};

export type SupportQueueBucket = {
  status: SupportTicketStatusId;
  label: string;
  tickets: SupportTicketRecord[];
};

export type SupportMetricValue = {
  id: SupportMetricId;
  label: string;
  value: string;
  numericValue?: number;
};

export type SupportCenterBundle = {
  generatedAt: string;
  metrics: SupportMetricValue[];
  queue: SupportQueueBucket[];
  escalations: SupportTicketRecord[];
  resolutions: SupportTicketRecord[];
  selectedTicket: SupportTicketRecord | null;
};
