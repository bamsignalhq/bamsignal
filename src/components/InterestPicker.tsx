import { useState } from "react";
import { InterestPickerSheet } from "./profile/InterestPickerSheet";
import { ProfileInterestsPreview } from "./profile/ProfileInterestsPreview";

type InterestPickerProps = {
  selected: string[];
  onChange: (interests: string[]) => void;
  /** Onboarding uses “Choose interests”; edit profile uses “Edit interests” when empty vs filled */
  variant?: "onboarding" | "edit";
};

export function InterestPicker({ selected, onChange, variant = "edit" }: InterestPickerProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const openLabel =
    selected.length === 0
      ? variant === "onboarding"
        ? "Choose interests"
        : "Choose interests"
      : "Edit interests";

  return (
    <fieldset className="intent-fieldset interest-picker interest-picker--collapsed">
      <legend>Interests</legend>

      {selected.length > 0 ? (
        <ProfileInterestsPreview interests={selected} onMoreClick={() => setSheetOpen(true)} />
      ) : null}

      <button type="button" className="interest-picker__open btn-secondary btn-full" onClick={() => setSheetOpen(true)}>
        {openLabel}
      </button>

      <InterestPickerSheet
        open={sheetOpen}
        selected={selected}
        onChange={onChange}
        onClose={() => setSheetOpen(false)}
      />
    </fieldset>
  );
}
