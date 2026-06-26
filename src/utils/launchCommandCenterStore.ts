import {
  LAUNCH_COMMAND_BLOCKER_SEED,
  LAUNCH_COMMAND_DEPLOYMENT_SEED,
  LAUNCH_COMMAND_INCIDENT_SEED,
  LAUNCH_COMMAND_SECTION_SEED,
  LAUNCH_COMMAND_SERVICE_SEED,
  LAUNCH_READINESS_SCORE_SEED
} from "../data/launchCommandCenterSeed";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.launchCommandCenter.v1";

type LaunchCommandCenterState = {
  readinessScores: typeof LAUNCH_READINESS_SCORE_SEED;
  blockers: typeof LAUNCH_COMMAND_BLOCKER_SEED;
  sections: typeof LAUNCH_COMMAND_SECTION_SEED;
  criticalServices: typeof LAUNCH_COMMAND_SERVICE_SEED;
  incidents: typeof LAUNCH_COMMAND_INCIDENT_SEED;
  deployments: typeof LAUNCH_COMMAND_DEPLOYMENT_SEED;
  updatedAt: string;
};

function defaultState(): LaunchCommandCenterState {
  return {
    readinessScores: [...LAUNCH_READINESS_SCORE_SEED],
    blockers: [...LAUNCH_COMMAND_BLOCKER_SEED],
    sections: [...LAUNCH_COMMAND_SECTION_SEED],
    criticalServices: [...LAUNCH_COMMAND_SERVICE_SEED],
    incidents: [...LAUNCH_COMMAND_INCIDENT_SEED],
    deployments: [...LAUNCH_COMMAND_DEPLOYMENT_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): LaunchCommandCenterState {
  const stored = readJson<LaunchCommandCenterState>(STORAGE_KEY, defaultState());
  if (!stored?.readinessScores?.length) return defaultState();
  return { ...defaultState(), ...stored };
}

function saveState(state: LaunchCommandCenterState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export function listLaunchReadinessScores() {
  return loadState().readinessScores;
}

export function listLaunchCommandBlockers() {
  return loadState().blockers;
}

export function listLaunchCommandSections() {
  return loadState().sections;
}

export function listLaunchCommandServices() {
  return loadState().criticalServices;
}

export function listLaunchCommandIncidents() {
  return loadState().incidents;
}

export function listLaunchCommandDeployments() {
  return loadState().deployments;
}

export function refreshLaunchCommandCenterState(): void {
  saveState(defaultState());
}
