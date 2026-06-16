import { forwardRef, useCallback, type ClipboardEvent } from "react";

type OtpCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  className?: string;
  verifying?: boolean;
  id?: string;
  "aria-label"?: string;
};

export const OtpCodeInput = forwardRef<HTMLInputElement, OtpCodeInputProps>(function OtpCodeInput(
  {
    value,
    onChange,
    length = 6,
    className = "",
    verifying = false,
    id,
    "aria-label": ariaLabel = "Verification code"
  },
  ref
) {
  const applyValue = useCallback(
    (raw: string) => {
      onChange(raw.replace(/\D/g, "").slice(0, length));
    },
    [length, onChange]
  );

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text");
    if (!pasted) return;
    event.preventDefault();
    applyValue(pasted);
  };

  return (
    <input
      ref={ref}
      id={id}
      className={`otp-code-input ${className}`.trim()}
      type="tel"
      name="otp"
      inputMode="numeric"
      autoComplete="one-time-code"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      enterKeyHint="done"
      pattern="[0-9]*"
      maxLength={length}
      value={value}
      aria-label={ariaLabel}
      aria-busy={verifying}
      onChange={(event) => applyValue(event.target.value)}
      onInput={(event) => applyValue(event.currentTarget.value)}
      onPaste={handlePaste}
    />
  );
});
