import { ChevronDown, X } from "lucide-react";
import { useState } from "react";

export type TapSelectOption<T extends string> = T | { value: T; label: string };

function optionValue<T extends string>(opt: TapSelectOption<T>): T {
  return typeof opt === "string" ? opt : opt.value;
}

function optionLabel<T extends string>(opt: TapSelectOption<T>): string {
  return typeof opt === "string" ? opt : opt.label;
}

type TapSelectFieldProps<T extends string> = {
  label: string;
  optional?: boolean;
  placeholder?: string;
  options: readonly TapSelectOption<T>[];
  value: T | T[] | undefined;
  multiple?: boolean;
  disabled?: boolean;
  onChange: (value: T | T[] | undefined) => void;
  formatValue?: (value: T) => string;
};

export function TapSelectField<T extends string>({
  label,
  optional = false,
  placeholder = "Select",
  options,
  value,
  multiple = false,
  disabled = false,
  onChange,
  formatValue
}: TapSelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const selected: T[] = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value
      ? [value as T]
      : [];
  const format = formatValue ?? ((v: T) => v);

  const toggle = (opt: T) => {
    if (multiple) {
      const next = selected.includes(opt) ? selected.filter((v) => v !== opt) : [...selected, opt];
      onChange(next);
      return;
    }
    onChange(opt === value ? undefined : opt);
    setOpen(false);
  };

  const remove = (opt: T) => {
    if (multiple) {
      const next = selected.filter((v) => v !== opt);
      onChange(next.length ? next : []);
      return;
    }
    onChange(undefined);
  };

  const triggerLabel =
    selected.length === 0
      ? placeholder
      : multiple
        ? selected.length === 1
          ? format(selected[0])
          : `${selected.length} selected`
        : format(selected[0]);

  return (
    <div className={`tap-select-field${disabled ? " tap-select-field--disabled" : ""}`}>
      <span className="tap-select-field__label">
        {label}
        {optional ? <span className="label-optional"> (optional)</span> : null}
      </span>

      {selected.length > 0 ? (
        <div className="tap-select-field__chips">
          {selected.map((item) => (
            <button
              key={item}
              type="button"
              className="tap-select-chip"
              onClick={() => remove(item)}
              aria-label={`Remove ${format(item)}`}
            >
              {format(item)}
              <X size={14} aria-hidden />
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className="tap-select-field__trigger"
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>{triggerLabel}</span>
        <ChevronDown size={18} aria-hidden />
      </button>

      {open ? (
        <div className="tap-select-sheet" role="dialog" aria-modal="true" aria-label={label}>
          <button
            type="button"
            className="tap-select-sheet__backdrop"
            onClick={() => setOpen(false)}
            aria-label="Close"
          />
          <div className="tap-select-sheet__panel">
            <header className="tap-select-sheet__head">
              <h3>{label}</h3>
              <button type="button" className="tap-select-sheet__done" onClick={() => setOpen(false)}>
                Done
              </button>
            </header>
            <div className="tap-select-sheet__options intent-tags selectable">
              {options.map((opt) => {
                const v = optionValue(opt);
                const isSelected = selected.includes(v);
                return (
                  <button
                    key={v}
                    type="button"
                    className={`intent-tag ${isSelected ? "selected" : ""}`}
                    onClick={() => toggle(v)}
                  >
                    {optionLabel(opt)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
