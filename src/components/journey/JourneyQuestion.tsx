import type { ReactNode } from "react";

export function JourneyQuestion({
  title,
  lede,
  children
}: {
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <section className="journey-question">
      <h1 className="journey-question__title">{title}</h1>
      {lede ? <p className="journey-question__lede">{lede}</p> : null}
      {children}
    </section>
  );
}

export function JourneyInput({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  max,
  min,
  placeholder,
  maxLength
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  max?: string;
  min?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="journey-input" htmlFor={id}>
      <span className="journey-input__label">{label}</span>
      <input
        id={id}
        className="journey-input__field"
        type={type}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        max={max}
        min={min}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
