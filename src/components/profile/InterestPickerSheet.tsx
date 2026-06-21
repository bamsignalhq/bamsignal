import { MoreAboutMePickerSheet } from "../moreAboutMe/MoreAboutMePickerSheet";

type InterestPickerSheetProps = {
  open: boolean;
  selected: string[];
  onChange: (interests: string[]) => void;
  onClose: () => void;
  /** Legacy prop — More About Me is optional (0–8). */
  requireMinimum?: boolean;
};

/** @deprecated Use MoreAboutMePickerSheet */
export function InterestPickerSheet({
  open,
  selected,
  onChange,
  onClose
}: InterestPickerSheetProps) {
  return (
    <MoreAboutMePickerSheet
      open={open}
      selected={selected}
      onChange={onChange}
      onClose={onClose}
    />
  );
}
