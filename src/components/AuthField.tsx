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
  className?: string;
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
  className = ""
}: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password" || pin;
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <label className={`auth-field auth-field--float ${pin ? "auth-field--pin" : ""} ${className}`.trim()}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={inputType}
        inputMode={pin ? "numeric" : inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        placeholder=" "
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
  );
}
