/**
 * Passport signal errors — structured, never opaque.
 */

export class PassportSignalError extends Error {
  constructor(message, { code = "signal_error", status = 400, stage = null, details = null } = {}) {
    super(message);
    this.name = "PassportSignalError";
    this.code = code;
    this.status = status;
    this.stage = stage;
    this.details = details;
  }
}

export class PassportSignalDatabaseError extends PassportSignalError {
  constructor(message = "Passport signal storage unavailable") {
    super(message, { code: "database_unavailable", status: 503 });
    this.name = "PassportSignalDatabaseError";
  }
}

export class PassportSignalAuthorizationError extends PassportSignalError {
  constructor(message = "Contributor authorization failed") {
    super(message, { code: "contributor_unauthorized", status: 401, stage: "receive" });
    this.name = "PassportSignalAuthorizationError";
  }
}

export function isPassportSignalError(error) {
  return error instanceof PassportSignalError;
}
