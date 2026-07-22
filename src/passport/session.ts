import { STORAGE_KEYS } from "../constants/limits";
import { isKnownWorkspaceId } from "../workspaces/registry";
import type { WorkspaceId } from "../workspaces/types";
import { resolvePassportId } from "./id";
import { defaultPersonaForWorkspace, isKnownPersonaId, listPersonasForWorkspace } from "./personas/registry";
import type {
  IdentitySecurityStatus,
  IdentityVerificationStatus,
  IdentityConfidenceLevel,
  PassportIdentity,
  PassportProductId,
  PassportSessionState
} from "./types";

const SESSION_KEY = "stankings-passport-session-v1";
const IDENTITY_KEY = "stankings-passport-identity-v1";
/** Legacy workspace session — migrated once. */
const LEGACY_WORKSPACE_SESSION_KEY = "bamsignal-workspace-session-v1";
const LEGACY_EXPERIENCE_KEY = "bamsignal-active-experience";
const LEGACY_ROLES_KEY = "bamsignal-experience-roles";

const DEFAULT_SESSION: PassportSessionState = {
  version: 1,
  passportId: null,
  identityAnchor: null,
  selectedWorkspaceId: null,
  preferredWorkspaceId: null,
  availableWorkspaceIds: [],
  lastPathByWorkspace: {},
  selectedPersonaId: null,
  preferredPersonaId: null,
  availablePersonaIds: [],
  lastRoute: null
};

function readSessionRaw(): PassportSessionState {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { ...DEFAULT_SESSION };
    const parsed = JSON.parse(raw) as Partial<PassportSessionState>;
    const availableWorkspaceIds = Array.isArray(parsed.availableWorkspaceIds)
      ? parsed.availableWorkspaceIds.filter(isKnownWorkspaceId)
      : [];
    const availablePersonaIds = Array.isArray(parsed.availablePersonaIds)
      ? parsed.availablePersonaIds.filter((id): id is string => typeof id === "string" && isKnownPersonaId(id))
      : [];
    const lastPathByWorkspace: PassportSessionState["lastPathByWorkspace"] = {};
    if (parsed.lastPathByWorkspace && typeof parsed.lastPathByWorkspace === "object") {
      for (const [key, path] of Object.entries(parsed.lastPathByWorkspace)) {
        if (isKnownWorkspaceId(key) && typeof path === "string") {
          lastPathByWorkspace[key] = path;
        }
      }
    }
    return {
      version: 1,
      passportId: typeof parsed.passportId === "string" ? parsed.passportId : null,
      identityAnchor: typeof parsed.identityAnchor === "string" ? parsed.identityAnchor : null,
      selectedWorkspaceId: isKnownWorkspaceId(parsed.selectedWorkspaceId) ? parsed.selectedWorkspaceId : null,
      preferredWorkspaceId: isKnownWorkspaceId(parsed.preferredWorkspaceId)
        ? parsed.preferredWorkspaceId
        : null,
      availableWorkspaceIds,
      lastPathByWorkspace,
      selectedPersonaId:
        typeof parsed.selectedPersonaId === "string" && isKnownPersonaId(parsed.selectedPersonaId)
          ? parsed.selectedPersonaId
          : null,
      preferredPersonaId:
        typeof parsed.preferredPersonaId === "string" && isKnownPersonaId(parsed.preferredPersonaId)
          ? parsed.preferredPersonaId
          : null,
      availablePersonaIds,
      lastRoute: typeof parsed.lastRoute === "string" ? parsed.lastRoute : null
    };
  } catch {
    return { ...DEFAULT_SESSION };
  }
}

function writeSession(state: PassportSessionState): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

function migrateLegacySession(): PassportSessionState {
  const current = readSessionRaw();
  if (current.passportId || current.availableWorkspaceIds.length > 0) {
    return current;
  }
  try {
    const legacyRaw = localStorage.getItem(LEGACY_WORKSPACE_SESSION_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as Partial<PassportSessionState>;
      const next: PassportSessionState = {
        ...current,
        selectedWorkspaceId: isKnownWorkspaceId(legacy.selectedWorkspaceId)
          ? legacy.selectedWorkspaceId
          : null,
        preferredWorkspaceId: isKnownWorkspaceId(legacy.preferredWorkspaceId)
          ? legacy.preferredWorkspaceId
          : null,
        availableWorkspaceIds: Array.isArray(legacy.availableWorkspaceIds)
          ? legacy.availableWorkspaceIds.filter(isKnownWorkspaceId)
          : [],
        lastPathByWorkspace:
          legacy.lastPathByWorkspace && typeof legacy.lastPathByWorkspace === "object"
            ? Object.fromEntries(
                Object.entries(legacy.lastPathByWorkspace).filter(
                  ([k, v]) => isKnownWorkspaceId(k) && typeof v === "string"
                )
              )
            : {}
      };
      writeSession(next);
      return next;
    }
    const rolesRaw = localStorage.getItem(LEGACY_ROLES_KEY);
    const experience = localStorage.getItem(LEGACY_EXPERIENCE_KEY);
    const available: WorkspaceId[] = [];
    if (rolesRaw) {
      const roles = JSON.parse(rolesRaw) as { member?: boolean; concierge?: boolean };
      if (roles.member) available.push("member");
      if (roles.concierge) available.push("concierge");
    }
    if (experience === "concierge" && !available.includes("concierge")) available.push("concierge");
    if (experience === "member" && !available.includes("member")) available.push("member");
    if (available.length === 0) return current;
    const next: PassportSessionState = {
      ...current,
      availableWorkspaceIds: available,
      selectedWorkspaceId:
        experience === "concierge" ? "concierge" : available.includes("member") ? "member" : available[0],
      preferredWorkspaceId:
        experience === "concierge" ? "concierge" : available.includes("member") ? "member" : available[0]
    };
    writeSession(next);
    return next;
  } catch {
    return current;
  }
}

export function getPassportSession(): PassportSessionState {
  return migrateLegacySession();
}

export function updatePassportSession(
  patch: Partial<Omit<PassportSessionState, "version">>
): PassportSessionState {
  const next: PassportSessionState = { ...getPassportSession(), ...patch, version: 1 };
  writeSession(next);
  return next;
}

function readIdentityRecord(): PassportIdentity | null {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PassportIdentity;
    if (!parsed?.passportId) return null;
    if (!parsed.identityConfidence) {
      parsed.identityConfidence = identityConfidenceFromVerification(parsed.verificationStatus ?? "unverified");
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeIdentityRecord(identity: PassportIdentity): void {
  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  } catch {
    /* ignore quota */
  }
}

function resolveIdentityAnchor(options?: {
  authUserId?: string;
  memberProfileId?: string;
  username?: string;
}): string {
  const authUserId = options?.authUserId?.trim();
  if (authUserId) return `auth:${authUserId}`;
  const memberProfileId =
    options?.memberProfileId?.trim() ||
    (typeof localStorage !== "undefined"
      ? localStorage.getItem(STORAGE_KEYS.memberProfileId) || ""
      : "");
  if (memberProfileId) return `member:${memberProfileId}`;
  const username = options?.username?.trim().toLowerCase();
  if (username) return `username:${username}`;
  return "";
}

function verificationStatusFromProfile(options: {
  emailVerified?: boolean;
  phoneVerified?: boolean;
}): IdentityVerificationStatus {
  if (options.emailVerified && options.phoneVerified) return "verified";
  if (options.emailVerified || options.phoneVerified) return "partial";
  return "unverified";
}

function identityConfidenceFromVerification(
  status: IdentityVerificationStatus
): IdentityConfidenceLevel {
  if (status === "verified") return "medium";
  if (status === "partial") return "low";
  return "pending";
}

/** Bind or refresh Passport identity for the signed-in human. Existing users auto-map. */
export function bindPassportIdentity(input: {
  username?: string;
  email?: string;
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  authUserId?: string;
  memberProfileId?: string;
  securityStatus?: IdentitySecurityStatus;
  productId?: PassportProductId;
}): PassportIdentity {
  const anchor = resolveIdentityAnchor(input);
  const passportId = resolvePassportId(anchor || input.username || "bamsignal-anonymous");
  const now = new Date().toISOString();
  const existing = readIdentityRecord();
  const boundProducts = new Set<PassportProductId>(existing?.boundProducts ?? []);
  boundProducts.add(input.productId ?? "bamsignal");

  const verificationStatus = verificationStatusFromProfile({
    emailVerified: input.emailVerified ?? existing?.emailVerified,
    phoneVerified: input.phoneVerified ?? existing?.phoneVerified
  });

  const identity: PassportIdentity = {
    passportId,
    anchor: anchor || existing?.anchor || passportId,
    username: input.username?.trim() || existing?.username || "",
    email: input.email?.trim() || existing?.email || "",
    phone: input.phone?.trim() || existing?.phone || "",
    emailVerified: Boolean(input.emailVerified ?? existing?.emailVerified),
    phoneVerified: Boolean(input.phoneVerified ?? existing?.phoneVerified),
    verificationStatus,
    identityConfidence: identityConfidenceFromVerification(verificationStatus),
    securityStatus: input.securityStatus ?? existing?.securityStatus ?? "normal",
    boundProducts: [...boundProducts],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };

  writeIdentityRecord(identity);
  updatePassportSession({
    passportId,
    identityAnchor: identity.anchor
  });
  return identity;
}

export function getPassportIdentity(): PassportIdentity | null {
  return readIdentityRecord();
}

export function getPassportId(): string | null {
  return getPassportSession().passportId ?? getPassportIdentity()?.passportId ?? null;
}

export function markPersonaAvailable(personaId: string): void {
  if (!isKnownPersonaId(personaId)) return;
  const state = getPassportSession();
  if (state.availablePersonaIds.includes(personaId)) return;
  updatePassportSession({
    availablePersonaIds: [...state.availablePersonaIds, personaId]
  });
}

export function selectPersona(
  personaId: string,
  options?: { setPreferred?: boolean; workspaceId?: WorkspaceId }
): void {
  if (!isKnownPersonaId(personaId)) return;
  const state = getPassportSession();
  const available = state.availablePersonaIds.includes(personaId)
    ? state.availablePersonaIds
    : [...state.availablePersonaIds, personaId];
  updatePassportSession({
    selectedPersonaId: personaId,
    preferredPersonaId: options?.setPreferred === false ? state.preferredPersonaId : personaId,
    availablePersonaIds: available,
    selectedWorkspaceId: options?.workspaceId ?? state.selectedWorkspaceId
  });
}

export function syncPersonaForWorkspace(workspaceId: WorkspaceId, isPremium?: boolean): void {
  const state = getPassportSession();
  const defaultId = defaultPersonaForWorkspace(workspaceId);
  if (!defaultId) return;
  let personaId = defaultId;
  if (workspaceId === "member" && isPremium && isKnownPersonaId("premium-member")) {
    personaId = "premium-member";
    markPersonaAvailable("premium-member");
  }
  if (workspaceId === "concierge") {
    markPersonaAvailable("premium-concierge");
    personaId = "premium-concierge";
  } else if (workspaceId === "member") {
    markPersonaAvailable("dating-member");
  }
  const preferred =
    state.preferredPersonaId &&
    isKnownPersonaId(state.preferredPersonaId) &&
    listPersonasForWorkspace(workspaceId).some((p) => p.id === state.preferredPersonaId)
      ? state.preferredPersonaId
      : personaId;
  selectPersona(preferred, { setPreferred: false, workspaceId });
}

export function getSelectedPersonaId(): string | null {
  return getPassportSession().selectedPersonaId;
}

export function rememberPassportRoute(path: string): void {
  updatePassportSession({ lastRoute: path });
}

export function getLastPassportRoute(): string | null {
  return getPassportSession().lastRoute;
}

/** Workspace slice accessors — canonical store for workspaces/session.ts */
export function getPassportWorkspaceSlice() {
  const s = getPassportSession();
  return {
    selectedWorkspaceId: s.selectedWorkspaceId,
    preferredWorkspaceId: s.preferredWorkspaceId,
    availableWorkspaceIds: s.availableWorkspaceIds,
    lastPathByWorkspace: s.lastPathByWorkspace
  };
}

export function patchPassportWorkspaceSlice(
  patch: Partial<ReturnType<typeof getPassportWorkspaceSlice>>
): void {
  updatePassportSession(patch);
}
