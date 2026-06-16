import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";

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
  checking = false
}: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password" || pin;
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div className={`auth-field-wrap ${error ? "auth-field-wrap--error" : ""}`.trim()}>
      <label className={`auth-field auth-field--float ${pin ? "auth-field--pin" : ""} ${className}`.trim()}>
        <input
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
          aria-describedby={error ? `${label}-error` : undefined}
          className={pin ? "auth-code-input" : undefined}
        />
        <span>{label}</span>
        {isPassword && (
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
      {checking ? <p className="auth-field__hint">Checking…</p> : null}
      {error ? (
        <p id={`${label}-error`} className="auth-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
