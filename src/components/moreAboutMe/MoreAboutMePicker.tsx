import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { MORE_ABOUT_ME_TITLE } from "../../constants/moreAboutMe";
import { formatMoreAboutMeChip } from "../../constants/moreAboutMe";
import { normalizeMoreAboutMeInterests } from "../../utils/moreAboutMe";
import { formatMultiSelectSummary } from "../../utils/selectSummary";
import { MoreAboutMePickerSheet } from "./MoreAboutMePickerSheet";

type MoreAboutMePickerProps = {
  selected: string[];
  onChange: (items: string[]) => void;
  className?: string;
};

export function MoreAboutMePicker({ selected, onChange, className = "" }: MoreAboutMePickerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const normalized = normalizeMoreAboutMeInterests(selected);
  const hasSelection = normalized.length > 0;
  const summary = formatMultiSelectSummary(
    normalized.map((id) => formatMoreAboutMeChip(id)),
    (item) => item,
    "Add details"
  );

  return (
    <div className={`tap-select-field more-about-me-picker ${className}`.trim()}>
      <span className="tap-select-field__label">{MORE_ABOUT_ME_TITLE}</span>

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

      <MoreAboutMePickerSheet
        open={sheetOpen}
        selected={normalized}
        onChange={onChange}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
