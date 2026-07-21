import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes, type Ref } from "react";

type AuthFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "password";
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  maxLength?: number;
  pin?: boolean;
  autoCapitalize?: "off" | "none" | "on" | "sentences" | "words" | "characters";
  spellCheck?: boolean;
  className?: string;
  error?: string;
  checking?: boolean;
  available?: boolean;
  /** Show/hide toggle for PIN fields. */
  showToggle?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  id?: string;
};

export function AuthField({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  autoComplete,
  maxLength,
  pin = false,
  autoCapitalize,
  spellCheck,
  className = "",
  error = "",
  checking = false,
  available = false,
  showToggle = true,
  inputRef,
  id
}: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password" || pin;
  const inputType = isPassword ? (visible ? "text" : "password") : type;
  const errorId = `${(id || label).replace(/\s+/g, "-").toLowerCase()}-error`;
  const statusId = `${(id || label).replace(/\s+/g, "-").toLowerCase()}-status`;

  return (
    <div className={`auth-field-wrap ${error ? "auth-field-wrap--error" : ""}`.trim()}>
      <label className={`auth-field auth-field--float ${pin ? "auth-field--pin" : ""} ${className}`.trim()}>
        <input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={inputType}
          inputMode={pin ? "numeric" : inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          spellCheck={spellCheck}
          placeholder=" "
          aria-invalid={Boolean(error)}
          aria-describedby={[error ? errorId : null, checking || available ? statusId : null]
            .filter(Boolean)
            .join(" ") || undefined}
          className={
            pin ? (className.includes("auth-field--centered") ? "auth-pin-input" : "auth-code-input") : undefined
          }
        />
        <span>{label}</span>
        {isPassword && showToggle && (
          <button
            type="button"
            className="auth-field__toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide PIN" : "Show PIN"}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </label>
      {checking ? (
        <p id={statusId} className="auth-field__hint" aria-live="polite">
          Checking…
        </p>
      ) : null}
      {!checking && available && !error ? (
        <p id={statusId} className="auth-field__hint auth-field__hint--ok" aria-live="polite">
          Available ✓
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="auth-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
