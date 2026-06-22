import type { RelationshipFollowUpRecord } from "../types/relationshipFollowUp";

const CONSULTANT_ID = "consultant_ada";
const CONSULTANT_NAME = "Ada Okafor";

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export const RELATIONSHIP_FOLLOW_UP_SEED: RelationshipFollowUpRecord[] = [
  {
    id: "rfu_amaka_chidi",
    introductionId: "BS-IN-2026-0001",
    memberAId: "sc_member_amaka",
    memberBId: "sc_member_chidi",
    journeyAId: "BS-JR-2026-0001",
    journeyBId: "BS-JR-2026-0002",
    consultantId: CONSULTANT_ID,
    consultantName: CONSULTANT_NAME,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
    stage: "getting-to-know",
    pipelinePhase: "dating",
    healthLevel: "healthy",
    paused: false,
    outcome: "positive-progress",
    nextCheckInRhythm: "30-days",
    nextCheckInAt: daysFromNow(24),
    journal: [
      {
        id: "rj_1",
        at: daysAgo(2),
        author: "consultant",
        body: "Both optimistic. Families aware."
      },
      {
        id: "rj_2",
        at: daysAgo(1),
        author: "consultant",
        body: "Strong communication."
      }
    ],
    checkIns: [
      {
        id: "rc_1",
        at: daysAgo(2),
        rhythm: "7-days",
        checkInType: "conversation-progressing",
        notes: "Conversation progressing warmly.",
        outcome: "positive-progress",
        nextCheckInAt: daysFromNow(28)
      }
    ],
    milestones: [
      {
        id: "rm_1",
        milestoneId: "first-date",
        milestoneAt: daysAgo(1),
        recordedAt: daysAgo(1),
        note: "First thoughtful date completed."
      }
    ],
    celebrations: [],
    recoveryNotes: [],
    timeline: [
      {
        id: "rt_1",
        at: daysAgo(3),
        label: "Introduction Made",
        pipelinePhase: "introduction-made"
      },
      {
        id: "rt_2",
        at: daysAgo(2),
        label: "Still Talking",
        stage: "still-talking",
        pipelinePhase: "still-talking"
      },
      {
        id: "rt_3",
        at: daysAgo(1),
        label: "Getting To Know Each Other",
        stage: "getting-to-know",
        pipelinePhase: "dating"
      }
    ]
  }
];
