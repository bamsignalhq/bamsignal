import type { ExecutiveViewId } from "../constants/executiveDashboard";
import type { ExecutiveDashboardBundle } from "../types/executiveDashboard";
import { buildExecutiveDashboardBundle } from "./executiveDashboardLogic";
import { readJson } from "./storage";

const STORAGE_KEY = "bamsignal.executiveDashboard.v1";

type ExecutiveDashboardState = {
  preferredView: ExecutiveViewId;
  updatedAt: string;
};

function defaultState(): ExecutiveDashboardState {
  return {
    preferredView: "30-days",
    updatedAt: new Date().toISOString()
  };
}

function loadState(): ExecutiveDashboardState {
  return readJson<ExecutiveDashboardState>(STORAGE_KEY, defaultState()) ?? defaultState();
}

export function getPreferredExecutiveView(): ExecutiveViewId {
  return loadState().preferredView;
}

export function buildExecutiveDashboard(view?: ExecutiveViewId): ExecutiveDashboardBundle {
  const resolvedView = view ?? getPreferredExecutiveView();
  return buildExecutiveDashboardBundle(resolvedView);
}
