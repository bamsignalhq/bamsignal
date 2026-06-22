import {
  FUTURE_DIASPORA_CORRIDORS,
  PREPARED_DIASPORA_CORRIDORS,
  corridorRouteLabel,
  type FutureDiasporaCorridorDefinition
} from "../constants/diasporaCorridors";
import {
  buildDiasporaCorridorViewModel,
  sortCorridorsForDisplay,
  type DiasporaCorridorViewModel
} from "./diasporaCorridorsLogic";

export type DiasporaCorridorsBundle = {
  corridors: DiasporaCorridorViewModel[];
  futureCorridors: { id: string; routeLabel: string }[];
};

export function getDiasporaCorridorsBundle(): DiasporaCorridorsBundle {
  const corridors = sortCorridorsForDisplay(
    PREPARED_DIASPORA_CORRIDORS.map(buildDiasporaCorridorViewModel)
  );

  const futureCorridors = FUTURE_DIASPORA_CORRIDORS.map((corridor: FutureDiasporaCorridorDefinition) => ({
    id: corridor.id,
    routeLabel: corridorRouteLabel(corridor.originId, corridor.destinationId)
  }));

  return { corridors, futureCorridors };
}

export function getDiasporaCorridor(id: string): DiasporaCorridorViewModel | null {
  const definition = PREPARED_DIASPORA_CORRIDORS.find((corridor) => corridor.id === id);
  if (!definition) return null;
  return buildDiasporaCorridorViewModel(definition);
}
