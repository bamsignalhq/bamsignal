/** Internal recruiting CRM — Careers & Talent System™ */

import type { TalentPipelineStageId } from "../types/talentRecruiting";

export const TALENT_RECRUITING_BRAND = "Careers & Talent System™";
export const TALENT_RECRUITING_NAV_LABEL = "Talent";
export const TALENT_RECRUITING_PATH = "/hard/talent";

export const TALENT_PIPELINE_STAGES: {
  id: TalentPipelineStageId;
  label: string;
  hint: string;
}[] = [
  { id: "applications", label: "Applications", hint: "New submissions awaiting first review." },
  { id: "screening", label: "Screening", hint: "Profile, values, and role-fit assessment." },
  { id: "interviews", label: "Interviews", hint: "Structured conversations with hiring panel." },
  { id: "offers", label: "Offers", hint: "Offer preparation and negotiation." },
  { id: "hired", label: "Hired", hint: "Accepted offers and onboarding queue." },
  { id: "rejected", label: "Rejected", hint: "Closed applications with respectful follow-up." },
  { id: "talent-pool", label: "Talent Pool", hint: "Strong candidates held for future roles." }
];

export const TALENT_PIPELINE_STAGE_LABELS: Record<TalentPipelineStageId, string> = Object.fromEntries(
  TALENT_PIPELINE_STAGES.map((item) => [item.id, item.label])
) as Record<TalentPipelineStageId, string>;
