import { MoreAboutMePicker } from "./moreAboutMe/MoreAboutMePicker";

type InterestPickerProps = {
  selected: string[];
  onChange: (interests: string[]) => void;
  /** @deprecated optional everywhere */
  variant?: "onboarding" | "edit";
  className?: string;
};

/** @deprecated use MoreAboutMePicker */
export function InterestPicker({ selected, onChange, className }: InterestPickerProps) {
  return <MoreAboutMePicker selected={selected} onChange={onChange} className={className} />;
}

export { MoreAboutMePicker };
