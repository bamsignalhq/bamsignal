import type {
  SupportTicketCategoryId,
  SupportTicketPriorityId,
  SupportTicketStatusId,
  SupportMetricId
} from "../constants/supportCenter";

export type SupportTicketRecord = {
  id: string;
  ticketNumber: string;
  subject: string;
  categoryId: SupportTicketCategoryId;
  status: SupportTicketStatusId;
  priority: SupportTicketPriorityId;
  memberUsername: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  assignedTo: string;
  note: string;
};

export type KnowledgeBaseArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  categoryId: SupportTicketCategoryId;
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
  selectedTicket: SupportTicketRecord | null;
};
