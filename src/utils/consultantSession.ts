import { CONCIERGE_DIRECTORY_SEED } from "../data/conciergeConsultantDirectorySeed";
import type { ConciergeConsultantRoleId } from "../constants/conciergeConsultantRoles";
import {
  capabilitiesForRoles,
  roleHasCapability,
  type ConsultantCapability
} from "../constants/consultantPermissions";
import { CONSULTANT_LOGIN_PATH, CONSULTANT_ROUTES } from "../constants/consultantRoutes";

export const CONSULTANT_SESSION_KEY = "bamsignal-consultant-session";

/** Local demo PIN — replace with Supabase auth when ready. */
const CONSULTANT_LOCAL_PIN = "2468";

export type ConsultantSession = {
  consultantId: string;
  consultantName: string;
  email: string;
  roles: ConciergeConsultantRoleId[];
  primaryRole: ConciergeConsultantRoleId;
  loggedInAt: string;
};

function readSessionRaw(): ConsultantSession | null {
  try {
    const raw = localStorage.getItem(CONSULTANT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsultantSession;
    if (!parsed?.consultantId || !parsed.consultantName) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: ConsultantSession): void {
  localStorage.setItem(CONSULTANT_SESSION_KEY, JSON.stringify(session));
}

export function loginConsultant(email: string, pin: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  const consultant = CONCIERGE_DIRECTORY_SEED.find(
    (entry) => entry.email.toLowerCase() === normalizedEmail && entry.status === "active"
  );
  if (!consultant || pin !== CONSULTANT_LOCAL_PIN) {
    return false;
  }

  writeSession({
    consultantId: consultant.id,
    consultantName: consultant.name,
    email: consultant.email,
    roles: consultant.roles,
    primaryRole: consultant.primaryRole,
    loggedInAt: new Date().toISOString()
  });
  return true;
}

export function logoutConsultant(): void {
  localStorage.removeItem(CONSULTANT_SESSION_KEY);
}

export function getCurrentConsultant(): ConsultantSession | null {
  return readSessionRaw();
}

export function isConsultantLoggedIn(): boolean {
  return getCurrentConsultant() !== null;
}

export function hasConsultantCapability(capability: ConsultantCapability): boolean {
  const session = getCurrentConsultant();
  if (!session) return false;
  return roleHasCapability(session.roles, capability);
}

export function hasConsultantRole(role: ConciergeConsultantRoleId): boolean {
  const session = getCurrentConsultant();
  if (!session) return false;
  return session.roles.includes(role);
}

export function getConsultantCapabilities(): ConsultantCapability[] {
  const session = getCurrentConsultant();
  if (!session) return [];
  return capabilitiesForRoles(session.roles);
}

/**
 * Intended post-login destination for consultants.
 * Do not route consultants to admin dashboard or member dashboard.
 */
export function resolveConciergeConsultantEntry(session: ConsultantSession | null): {
  route: string;
  view: "portfolio" | "members" | "introductions" | "followups" | "applications";
} {
  if (!session) {
    return { route: CONSULTANT_LOGIN_PATH, view: "portfolio" };
  }

  const caps = capabilitiesForRoles(session.roles);

  if (caps.includes("view-portfolio")) {
    return { route: CONSULTANT_ROUTES.portfolio, view: "portfolio" };
  }
  if (caps.includes("view-members") || caps.includes("legacy-members") || caps.includes("global-members")) {
    return { route: CONSULTANT_ROUTES.members, view: "members" };
  }
  if (caps.includes("manage-introductions")) {
    return { route: CONSULTANT_ROUTES.introductions, view: "introductions" };
  }
  if (caps.includes("manage-followups")) {
    return { route: CONSULTANT_ROUTES.followups, view: "followups" };
  }
  if (caps.includes("review-applications")) {
    return { route: CONSULTANT_ROUTES.members, view: "applications" };
  }
  if (caps.includes("view-family-journeys") || caps.includes("view-global-members")) {
    return { route: CONSULTANT_ROUTES.members, view: "members" };
  }

  return { route: CONSULTANT_ROUTES.portfolio, view: "portfolio" };
}
