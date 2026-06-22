import type {
  ApplicationApprovalFutureCapability,
  ApplicationApprovalStatus,
  ReviewTimelineKind
} from "../types/applicationApproval";

export const APPLICATION_APPROVAL_ENGINE_BRAND = "Application Approval Engine™";

export const APPLICATION_APPROVAL_HUMAN_COPY =
  "Human-led review — no scoring, no algorithms. Stewards decide with care.";

/** Permanent Review IDs — BS-AR-YYYY-#### */
export const APPLICATION_REVIEW_ID_PREFIX = "BS-AR";
export const APPLICATION_REVIEW_ID_PATTERN = /^BS-AR-\d{4}-\d{4}$/;
export const APPLICATION_REVIEW_ID_LABEL = "Review ID";

export const APPLICATION_APPROVAL_STATUS_ORDER: ApplicationApprovalStatus[] = [
  "submitted",
  "under-review",
  "additional-information",
  "approved",
  "declined",
  "withdrawn"
];

export const APPLICATION_APPROVAL_STATUS_LABELS: Record<ApplicationApprovalStatus, string> = {
  submitted: "Submitted",
  "under-review": "Under review",
  "additional-information": "Additional information",
  approved: "Approved",
  declined: "Declined",
  withdrawn: "Withdrawn"
};

export const APPLICATION_APPROVAL_STATUS_HINTS: Record<ApplicationApprovalStatus, string> = {
  submitted: "Application received — awaiting steward review.",
  "under-review": "A steward is reviewing privately.",
  "additional-information": "Member may be asked for gentle clarification.",
  approved: "Approved for the introduction stage.",
  declined: "Application not continued at this time.",
  withdrawn: "Member withdrew the application."
};

export const APPLICATION_APPROVAL_TIMELINE_STEPS: {
  kind: ReviewTimelineKind;
  label: string;
  detail: string;
}[] = [
  { kind: "application-submitted", label: "Application Submitted", detail: "Member application received." },
  { kind: "review-started", label: "Review Started", detail: "Steward began private review." },
  {
    kind: "consultant-recommendation",
    label: "Consultant Recommendation",
    detail: "Steward recorded a human recommendation."
  },
  { kind: "decision", label: "Decision", detail: "Final approval decision recorded." }
];

export const APPLICATION_APPROVAL_APPEND_ONLY_RULE =
  "Append-only — timeline never shrinks. Journey memory preserved.";

export const APPLICATION_APPROVAL_FUTURE_CAPABILITIES: {
  id: ApplicationApprovalFutureCapability;
  label: string;
}[] = [
  { id: "compatibility-specialists", label: "Compatibility specialists" },
  { id: "multiple-reviewers", label: "Multiple reviewers" },
  { id: "family-advisors", label: "Family advisors" },
  { id: "ai-assistance", label: "AI assistance" }
];

/**
 * Future-ready architecture hooks — not implemented.
 */
export const APPLICATION_APPROVAL_FUTURE_ARCHITECTURE = {
  compatibilitySpecialists: "Route reviews to compatibility stewards when needed.",
  multipleReviewers: "Support secondary reviewer sign-off without algorithmic scoring.",
  familyAdvisors: "Invite family advisors into private review — human consent required.",
  aiAssistance: "Draft steward notes for human review — never auto-decide."
} as const;

export function formatApplicationReviewId(year: number, sequence: number): string {
  return `${APPLICATION_REVIEW_ID_PREFIX}-${year}-${String(sequence).padStart(4, "0")}`;
}

export function isValidApplicationReviewId(value: string): boolean {
  return APPLICATION_REVIEW_ID_PATTERN.test(value.trim().toUpperCase());
}

export function normalizeApplicationReviewId(value: string): string {
  return value.trim().toUpperCase();
}

export function parseApplicationReviewId(value: string): { year: number; sequence: number } | null {
  const trimmed = value.trim().toUpperCase();
  const match = trimmed.match(/^BS-AR-(\d{4})-(\d{4})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const sequence = Number(match[2]);
  if (sequence < 1) return null;
  return { year, sequence };
}

export function applicationReviewIdYearFromDate(
  isoDate: string,
  fallbackYear = new Date().getFullYear()
): number {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return fallbackYear;
  return new Date(parsed).getUTCFullYear();
}
