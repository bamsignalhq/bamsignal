import { useState } from "react";
import { PROFILE_INTERESTS_PREVIEW } from "../constants/interestCategories";
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
  const openSheet = () => setSheetOpen(true);
  const hasSelection = selected.length > 0;
  const showMoreChip = selected.length > PROFILE_INTERESTS_PREVIEW;

  return (
    <fieldset className="intent-fieldset interest-picker interest-picker--collapsed">
      <legend>Interests</legend>

      {hasSelection ? (
        <>
          <ProfileInterestsPreview interests={selected} onMoreClick={showMoreChip ? openSheet : undefined} />
          {variant === "onboarding" && !showMoreChip ? (
            <button type="button" className="link-btn interest-picker__change" onClick={openSheet}>
              Change interests
            </button>
          ) : null}
        </>
      ) : null}

      {variant === "edit" || !hasSelection ? (
        <button type="button" className="interest-picker__open btn-secondary btn-full" onClick={openSheet}>
          {hasSelection ? "Edit interests" : "Choose interests"}
        </button>
      ) : null}

      <InterestPickerSheet
        open={sheetOpen}
        selected={selected}
        onChange={onChange}
        onClose={() => setSheetOpen(false)}
        requireMinimum={variant === "onboarding"}
      />
    </fieldset>
  );
}
