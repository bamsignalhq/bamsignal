/** Concierge login "Remember me" username — separate from workspace session. */

const REMEMBER_USERNAME_KEY = "bamsignal-concierge-remember-username";

export function getRememberedConciergeUsername(): string {
  try {
    return localStorage.getItem(REMEMBER_USERNAME_KEY) || "";
  } catch {
    return "";
  }
}

export function setRememberedConciergeUsername(username: string | null): void {
  try {
    if (!username) {
      localStorage.removeItem(REMEMBER_USERNAME_KEY);
      return;
    }
    localStorage.setItem(REMEMBER_USERNAME_KEY, username.trim().toLowerCase());
  } catch {
    /* ignore */
  }
}
