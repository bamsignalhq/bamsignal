/** BamSignal does not index local careers routes — hiring lives on Stankings. */
export const CAREERS_HUB_PATHS = [];

export function getCareersIndexablePaths() {
  return [...CAREERS_HUB_PATHS];
}
