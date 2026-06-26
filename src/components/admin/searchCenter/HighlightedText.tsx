import type { SearchHighlightPart } from "../../../types/searchCenter";

type HighlightedTextProps = {
  parts: SearchHighlightPart[];
};

export function HighlightedText({ parts }: HighlightedTextProps) {
  return (
    <>
      {parts.map((part, index) =>
        part.highlight ? (
          <mark key={index} className="search-highlight">
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </>
  );
}
