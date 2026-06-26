import type { IntentTag } from "../types";
import { isQuickiePassActive, QUICKIE_INTENT } from "./quickie";

/** Remove unpaid Fast Connection intent — pass must be active to keep Quickie on profile. */
export function sanitizeIntentsForActivePass(intents: IntentTag[]): IntentTag[] {
  if (isQuickiePassActive()) return intents;
  const filtered = intents.filter((intent) => intent !== QUICKIE_INTENT);
  if (filtered.length) return filtered;
  return intents.includes(QUICKIE_INTENT) ? ["SeriousRelationship"] : filtered;
}
