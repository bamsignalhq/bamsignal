/**
 * Consultant session routing — re-exports canonical consultant portal session.
 */
import { CONCIERGE_CONSULTANT_HOME_ROUTE } from "../constants/conciergeConsultantRoles";
import {
  CONSULTANT_SESSION_KEY,
  getCurrentConsultant,
  resolveConciergeConsultantEntry,
  type ConsultantSession
} from "./consultantSession";

export { CONSULTANT_SESSION_KEY as CONCIERGE_CONSULTANT_SESSION_KEY };
export type ConciergeConsultantSession = ConsultantSession & { portfolioOnly?: true };

export function getConciergeConsultantHomeRoute(): string {
  return CONCIERGE_CONSULTANT_HOME_ROUTE;
}

export { resolveConciergeConsultantEntry };

/** @deprecated use getCurrentConsultant from consultantSession */
export function getConciergeConsultantSession(): ConsultantSession | null {
  return getCurrentConsultant();
}
