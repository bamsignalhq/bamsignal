import type {
  RelationshipHealthAlertSeverity,
  RelationshipHealthAlertStatus,
  RelationshipHealthAlertType,
  RelationshipHealthAlertVisibility
} from "../constants/relationshipHealthAlerts";

export type RelationshipHealthAlertEntry = {
  id: string;
  journeyId: string;
  introductionId?: string;
  coupleLabel?: string;
  alertType: RelationshipHealthAlertType;
  severity: RelationshipHealthAlertSeverity;
  supportNote?: string;
  createdAt: string;
  createdBy?: string;
  visibility: RelationshipHealthAlertVisibility;
  status: RelationshipHealthAlertStatus;
};

export type AddRelationshipHealthAlertInput = {
  journeyId: string;
  introductionId?: string;
  coupleLabel?: string;
  alertType: RelationshipHealthAlertType;
  severity: RelationshipHealthAlertSeverity;
  supportNote?: string;
  createdBy?: string;
};
