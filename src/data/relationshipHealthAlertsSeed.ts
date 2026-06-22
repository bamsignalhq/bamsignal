import type { RelationshipHealthAlertEntry } from "../types/relationshipHealthAlerts";
import { createHealthAlertEntry } from "../utils/relationshipHealthAlertsLogic";

const JOURNEY_ID = "BS-JR-2028-0045";
const INTRODUCTION_ID = "BS-IN-2026-0001";

export const RELATIONSHIP_HEALTH_ALERTS_SEED: RelationshipHealthAlertEntry[] = [
  createHealthAlertEntry({
    id: "rha_seed_1",
    journeyId: JOURNEY_ID,
    introductionId: INTRODUCTION_ID,
    coupleLabel: "Amaka & Chidi",
    alertType: "communication-concerns",
    severity: "moderate",
    supportNote: "Check-in rhythm slowed — offer Journey Support, not pressure.",
    createdBy: "Ada Okafor",
    createdAt: "2028-09-12T10:00:00.000Z",
    status: "open"
  }),
  createHealthAlertEntry({
    id: "rha_seed_2",
    journeyId: JOURNEY_ID,
    introductionId: INTRODUCTION_ID,
    coupleLabel: "Amaka & Chidi",
    alertType: "family-pressure",
    severity: "low",
    supportNote: "Families supportive overall — monitor alignment before engagement talks.",
    createdBy: "Ada Okafor",
    createdAt: "2028-10-01T10:00:00.000Z",
    status: "acknowledged"
  }),
  createHealthAlertEntry({
    id: "rha_seed_3",
    journeyId: JOURNEY_ID,
    introductionId: INTRODUCTION_ID,
    coupleLabel: "Amaka & Chidi",
    alertType: "relocation-stress",
    severity: "high",
    supportNote: "Canada relocation planning underway — diaspora support opportunity.",
    createdBy: "Ada Okafor",
    createdAt: "2028-11-05T10:00:00.000Z",
    status: "support-planned"
  })
];
