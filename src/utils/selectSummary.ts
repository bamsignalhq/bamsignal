/** Compact one-line summary for multi-select trigger fields. */
export function formatMultiSelectSummary<T>(
  selected: T[],
  format: (value: T) => string,
  placeholder = "Select"
): string {
  if (selected.length === 0) return placeholder;
  if (selected.length === 1) return format(selected[0]);
  if (selected.length === 2) return `${format(selected[0])} · ${format(selected[1])}`;
  return `${format(selected[0])} · ${format(selected[1])} · +${selected.length - 2}`;
}
