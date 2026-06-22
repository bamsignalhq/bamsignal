import { RELATIONSHIP_HEALTH_ALERT_FUTURE_ADVISORS } from "../constants/relationshipHealthAlerts";
import type {
  AddRelationshipHealthAlertInput,
  RelationshipHealthAlertEntry
} from "../types/relationshipHealthAlerts";
import {
  acknowledgeRelationshipHealthAlert,
  addRelationshipHealthAlertToStore,
  getRelationshipHealthAlert,
  listRelationshipHealthAlerts,
  listRelationshipHealthAlertsForJourney,
  listRelationshipSupportQueue,
  planRelationshipHealthAlertSupport
} from "./relationshipHealthAlertsStore";

export function listHealthAlertFutureAdvisors() {
  return RELATIONSHIP_HEALTH_ALERT_FUTURE_ADVISORS;
}

export function addRelationshipHealthAlert(
  input: AddRelationshipHealthAlertInput
): RelationshipHealthAlertEntry {
  return addRelationshipHealthAlertToStore(input);
}

export function getHealthAlert(id: string): RelationshipHealthAlertEntry | null {
  return getRelationshipHealthAlert(id);
}

export function listHealthAlerts(): RelationshipHealthAlertEntry[] {
  return listRelationshipHealthAlerts();
}

export function listHealthAlertsForJourney(journeyId: string): RelationshipHealthAlertEntry[] {
  return listRelationshipHealthAlertsForJourney(journeyId);
}

export function getRelationshipSupportQueue(): RelationshipHealthAlertEntry[] {
  return listRelationshipSupportQueue();
}

export function acknowledgeHealthAlertById(id: string): RelationshipHealthAlertEntry | null {
  return acknowledgeRelationshipHealthAlert(id);
}

export function planSupportForHealthAlert(id: string): RelationshipHealthAlertEntry | null {
  return planRelationshipHealthAlertSupport(id);
}
