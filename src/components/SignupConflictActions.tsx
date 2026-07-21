import type { SignupConflict, SignupConflictField } from "../constants/signupConflicts";

type SignupConflictActionsProps = {
  conflicts: SignupConflict[];
  usernameSuggestions?: string[];
  onEditField: (field: SignupConflictField) => void;
  onUseSuggestion?: (username: string) => void;
  onLogin: () => void;
  onForgotPin?: () => void;
  onForgotUsername?: () => void;
  onRecoverAccount?: () => void;
};

/**
 * Inline signup conflict panel — keeps the user on the signup form.
 */
export function SignupConflictActions({
  conflicts,
  usernameSuggestions = [],
  onEditField,
  onUseSuggestion,
  onLogin,
  onForgotPin,
  onForgotUsername,
  onRecoverAccount
}: SignupConflictActionsProps) {
  if (!conflicts.length) return null;

  const has = (field: SignupConflictField) => conflicts.some((item) => item.field === field);

  return (
    <section className="signup-conflict" aria-live="polite" aria-label="Account conflicts">
      <p className="signup-conflict__title">Fix the highlighted fields to continue</p>
      <ul className="signup-conflict__list">
        {conflicts.map((item) => (
          <li key={item.field}>
            <span aria-hidden>✕</span> {item.message}
          </li>
        ))}
      </ul>

      {has("username") ? (
        <div className="signup-conflict__block">
          <button type="button" className="auth-link-secondary" onClick={() => onEditField("username")}>
            Edit username
          </button>
          {usernameSuggestions.length > 0 ? (
            <div className="signup-conflict__suggestions" role="group" aria-label="Username suggestions">
              {usernameSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="signup-conflict__chip"
                  onClick={() => onUseSuggestion?.(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {has("email") ? (
        <div className="signup-conflict__actions">
          <button type="button" className="auth-link-secondary" onClick={() => onEditField("email")}>
            Edit email
          </button>
          <button type="button" className="auth-link-secondary" onClick={() => onEditField("email")}>
            Use another email
          </button>
          <button type="button" className="auth-link-secondary" onClick={onLogin}>
            Login
          </button>
          {onForgotPin ? (
            <button type="button" className="auth-link-secondary" onClick={onForgotPin}>
              Forgot PIN?
            </button>
          ) : null}
        </div>
      ) : null}

      {has("phone") ? (
        <div className="signup-conflict__actions">
          <button type="button" className="auth-link-secondary" onClick={() => onEditField("phone")}>
            Use another phone number
          </button>
          <button type="button" className="auth-link-secondary" onClick={onLogin}>
            Login
          </button>
          {onRecoverAccount || onForgotUsername ? (
            <button
              type="button"
              className="auth-link-secondary"
              onClick={onRecoverAccount || onForgotUsername}
            >
              Recover account
            </button>
          ) : null}
        </div>
      ) : null}

      {!has("email") && !has("phone") && has("username") ? null : null}

      {onForgotUsername ? (
        <button type="button" className="auth-link-secondary" onClick={onForgotUsername}>
          Forgot username?
        </button>
      ) : null}
    </section>
  );
}
