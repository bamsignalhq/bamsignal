import { ChevronDown, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { formatMultiSelectSummary } from "../utils/selectSummary";

export type TapSelectOption<T extends string> = T | { value: T; label: string };

function optionValue<T extends string>(opt: TapSelectOption<T>): T {
  return typeof opt === "string" ? opt : opt.value;
}

function optionLabel<T extends string>(opt: TapSelectOption<T>): string {
  return typeof opt === "string" ? opt : opt.label;
}

function uniqueOptions<T extends string>(options: readonly TapSelectOption<T>[]): TapSelectOption<T>[] {
  const seen = new Set<T>();
  const out: TapSelectOption<T>[] = [];
  for (const opt of options) {
    const value = optionValue(opt);
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(opt);
  }
  return out;
}

function normalizeMultiValue<T extends string>(value: T[] | undefined, maxSelections?: number): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const item of value ?? []) {
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
    if (maxSelections != null && out.length >= maxSelections) break;
  }
  return out;
}

function multiValueChanged<T extends string>(left: T[], right: T[]): boolean {
  if (left.length !== right.length) return true;
  return left.some((item, index) => item !== right[index]);
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
  const optionList = useMemo(() => uniqueOptions(options), [options]);
  const selected: T[] = multiple
    ? normalizeMultiValue(Array.isArray(value) ? value : [], maxSelections)
    : value
      ? [value as T]
      : [];
  const format = formatValue ?? ((v: T) => v);
  const showSelectedChips = false;

  useEffect(() => {
    if (!multiple || !Array.isArray(value)) return;
    const normalized = normalizeMultiValue(value, maxSelections);
    if (multiValueChanged(value, normalized)) {
      onChange(normalized);
    }
  }, [value, multiple, maxSelections]);

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
      if (maxSelections === 1) {
        setSelectionLimitMessage("");
        onChange(selected.includes(opt) ? [] : [opt]);
        setOpen(false);
        return;
      }
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

              {showSelectedChips ? (
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
                {optionList.map((opt) => {
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
