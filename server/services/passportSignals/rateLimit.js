/**
 * Passport signal rate limiting — thin wrapper over shared rate limit service.
 */

import { checkRateLimit as sharedCheckRateLimit } from "../rateLimit.js";

export async function checkRateLimit(options) {
  return sharedCheckRateLimit(options);
}
