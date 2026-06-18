import { ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatMultiSelectSummary } from "../utils/selectSummary";

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
  maxSelections?: number;
  limitMessage?: string;
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
  formatValue,
  maxSelections,
  limitMessage
}: TapSelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const [selectionLimitMessage, setSelectionLimitMessage] = useState("");
  const selected: T[] = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value
      ? [value as T]
      : [];
  const format = formatValue ?? ((v: T) => v);

  useEffect(() => {
    if (!open) {
      setSelectionLimitMessage("");
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const toggle = (opt: T) => {
    if (multiple) {
      if (selected.includes(opt)) {
        setSelectionLimitMessage("");
        onChange(selected.filter((v) => v !== opt));
        return;
      }
      if (maxSelections != null && selected.length >= maxSelections) {
        setSelectionLimitMessage(limitMessage ?? `Choose up to ${maxSelections}.`);
        return;
      }
      setSelectionLimitMessage("");
      onChange([...selected, opt]);
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

  const triggerLabel = multiple
    ? formatMultiSelectSummary(selected, format, placeholder)
    : selected.length === 0
      ? placeholder
      : format(selected[0]);
  const hasSelection = selected.length > 0;

  const sheet =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="tap-select-sheet" role="dialog" aria-modal="true" aria-label={label}>
            <button
              type="button"
              className="tap-select-sheet__backdrop"
              onClick={() => setOpen(false)}
              aria-label="Close"
            />
            <div className="tap-select-sheet__panel">
              <header className="tap-select-sheet__head">
                <div>
                  <h3>{label}</h3>
                  {multiple && selected.length > 0 ? (
                    <p className="tap-select-sheet__count">
                      {maxSelections != null
                        ? `${selected.length} of ${maxSelections} selected`
                        : `${selected.length} selected`}
                    </p>
                  ) : null}
                </div>
                <button type="button" className="tap-select-sheet__done" onClick={() => setOpen(false)}>
                  Done
                </button>
              </header>

              {multiple && selected.length > 0 ? (
                <div className="tap-select-sheet__selected">
                  <div className="tap-select-sheet__chips">
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
                </div>
              ) : null}

              {selectionLimitMessage ? (
                <p className="tap-select-sheet__limit" role="status">
                  {selectionLimitMessage}
                </p>
              ) : null}

              <div className="tap-select-sheet__options intent-tags selectable">
                {options.map((opt) => {
                  const v = optionValue(opt);
                  const isSelected = selected.includes(v);
                  const blocked =
                    multiple &&
                    !isSelected &&
                    maxSelections != null &&
                    selected.length >= maxSelections;
                  return (
                    <button
                      key={v}
                      type="button"
                      className={`intent-tag ${isSelected ? "selected" : ""}${blocked ? " intent-tag--disabled" : ""}`}
                      onClick={() => toggle(v)}
                      disabled={blocked}
                      aria-pressed={isSelected}
                    >
                      {optionLabel(opt)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className={`tap-select-field${disabled ? " tap-select-field--disabled" : ""}`}>
      <span className="tap-select-field__label">
        {label}
        {optional ? <span className="label-optional"> optional</span> : null}
      </span>

      <button
        type="button"
        className="tap-select-field__trigger"
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span
          className={`tap-select-field__value${hasSelection ? "" : " tap-select-field__value--placeholder"}`}
        >
          {triggerLabel}
        </span>
        <ChevronDown size={18} className="tap-select-field__chevron" aria-hidden />
      </button>

      {sheet}
    </div>
  );
}
