type IcebreakerChipProps = {
  text: string;
  onSelect: (text: string) => void;
};

export function IcebreakerChip({ text, onSelect }: IcebreakerChipProps) {
  return (
    <button type="button" className="icebreaker-chip" onClick={() => onSelect(text)}>
      {text}
    </button>
  );
}
