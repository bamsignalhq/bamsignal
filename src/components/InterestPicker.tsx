import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { formatMultiSelectSummary } from "../utils/selectSummary";
import { InterestPickerSheet } from "./profile/InterestPickerSheet";

type InterestPickerProps = {
  selected: string[];
  onChange: (interests: string[]) => void;
  /** Onboarding uses minimum required in sheet */
  variant?: "onboarding" | "edit";
};

export function InterestPicker({ selected, onChange, variant = "edit" }: InterestPickerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const hasSelection = selected.length > 0;
  const summary = formatMultiSelectSummary(selected, (item) => item, "Select");

  return (
    <div className="tap-select-field interest-picker interest-picker--collapsed">
      <span className="tap-select-field__label">Interests</span>

      <button
        type="button"
        className="tap-select-field__trigger"
        onClick={() => setSheetOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={sheetOpen}
      >
        <span
          className={`tap-select-field__value${hasSelection ? "" : " tap-select-field__value--placeholder"}`}
        >
          {summary}
        </span>
        <ChevronDown size={18} className="tap-select-field__chevron" aria-hidden />
      </button>

      <InterestPickerSheet
        open={sheetOpen}
        selected={selected}
        onChange={onChange}
        onClose={() => setSheetOpen(false)}
        requireMinimum={variant === "onboarding"}
      />
    </div>
  );
}
