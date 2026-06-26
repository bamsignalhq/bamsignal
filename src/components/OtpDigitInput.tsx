import { useCallback, useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";

type OtpDigitInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  verifying?: boolean;
  id?: string;
  "aria-label"?: string;
};

export function OtpDigitInput({
  value,
  onChange,
  length = 6,
  onComplete,
  disabled = false,
  verifying = false,
  id,
  "aria-label": ariaLabel = "Verification code"
}: OtpDigitInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  const applyValue = useCallback(
    (raw: string) => {
      const next = raw.replace(/\D/g, "").slice(0, length);
      onChange(next);
      if (next.length === length) {
        onComplete?.(next);
      }
      return next;
    },
    [length, onChange, onComplete]
  );

  useEffect(() => {
    inputRefs.current[0]?.focus({ preventScroll: true });
  }, []);

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text");
    if (!pasted) return;
    event.preventDefault();
    applyValue(pasted);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      event.preventDefault();
      const next = value.slice(0, -1);
      onChange(next);
      inputRefs.current[index - 1]?.focus({ preventScroll: true });
    }
  };

  const handleInput = (index: number, digit: string) => {
    const cleaned = digit.replace(/\D/g, "");
    if (!cleaned) {
      const next = value.slice(0, index) + value.slice(index + 1);
      onChange(next);
      return;
    }

    const chars = cleaned.split("");
    let next = value.slice(0, index);
    for (let i = 0; i < chars.length && next.length < length; i += 1) {
      next += chars[i];
    }
    applyValue(next);
    const focusIndex = Math.min(next.length, length - 1);
    inputRefs.current[focusIndex]?.focus({ preventScroll: true });
  };

  return (
    <div
      id={id}
      className="otp-digit-input"
      role="group"
      aria-label={ariaLabel}
      aria-busy={verifying}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            inputRefs.current[index] = node;
          }}
          className="otp-digit-input__cell"
          type="tel"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          pattern="[0-9]*"
          maxLength={1}
          value={digits[index]?.trim() ? digits[index] : ""}
          disabled={disabled || verifying}
          aria-label={`Digit ${index + 1} of ${length}`}
          onChange={(event) => handleInput(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
