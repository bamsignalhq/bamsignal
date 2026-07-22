import { getPersonaDefinition } from "./personas/registry";
import { getPassportSession, getSelectedPersonaId } from "./session";
import type { PersonaPermission } from "./types";
import type { PersonaId } from "./personas/types";

export function personaCan(permission: PersonaPermission, personaId?: PersonaId | null): boolean {
  const id = personaId ?? (getSelectedPersonaId() as PersonaId | null);
  if (!id) return false;
  const def = getPersonaDefinition(id);
  if (!def.shipped) return false;
  const available = new Set(getPassportSession().availablePersonaIds);
  if (!available.has(id) && !def.isDefaultForWorkspace) return false;
  return def.permissions.includes(permission);
}

export function canUsePersona(id: PersonaId): boolean {
  const def = getPersonaDefinition(id);
  if (!def.shipped) return false;
  return getPassportSession().availablePersonaIds.includes(id) || Boolean(def.isDefaultForWorkspace);
}
