/**
 * Consultant session routing — architecture only.
 * Permissions and auth are not implemented yet.
 */
import { CONCIERGE_CONSULTANT_HOME_ROUTE } from "../constants/conciergeConsultantRoles";

export const CONCIERGE_CONSULTANT_SESSION_KEY = "bamsignal-concierge-consultant-session";

export type ConciergeConsultantSession = {
  consultantId: string;
  consultantName: string;
  /** When true, consultant should land on portfolio — never admin or member dashboards. */
  portfolioOnly: true;
};

export function getConciergeConsultantHomeRoute(): string {
  return CONCIERGE_CONSULTANT_HOME_ROUTE;
}

/**
 * Intended post-login destination for consultants.
 * Do not route consultants to admin dashboard or member dashboard.
 */
export function resolveConciergeConsultantEntry(
  session: ConciergeConsultantSession | null
): { route: string; view: "portfolio" } {
  if (session?.consultantId) {
    return { route: CONCIERGE_CONSULTANT_HOME_ROUTE, view: "portfolio" };
  }
  return { route: CONCIERGE_CONSULTANT_HOME_ROUTE, view: "portfolio" };
}
