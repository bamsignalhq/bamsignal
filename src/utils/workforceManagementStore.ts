import {
  WORKFORCE_ASSIGNMENT_SEED,
  WORKFORCE_AVAILABILITY_SEED,
  WORKFORCE_CAPACITY_SEED,
  WORKFORCE_FORECAST_SEED,
  WORKFORCE_LEAVE_SEED,
  WORKFORCE_PROFILE_SEED,
  WORKFORCE_REGIONAL_SEED,
  WORKFORCE_TRANSFER_SEED
} from "../data/workforceManagementSeed";
import type {
  ConsultantAssignmentRecord,
  ConsultantCapacityRecord,
  LeaveRequestRecord,
  RegionalAssignmentRecord,
  StaffingForecastRecord,
  WorkforceAvailabilitySlot,
  WorkforceProfileRecord,
  WorkforceTransferRecord
} from "../types/workforceManagement";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import { buildTransferRecord } from "./workforceTransferLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.workforceManagement.v1";

type WorkforceManagementState = {
  profiles: WorkforceProfileRecord[];
  availability: WorkforceAvailabilitySlot[];
  capacity: ConsultantCapacityRecord[];
  assignments: ConsultantAssignmentRecord[];
  regionalAssignments: RegionalAssignmentRecord[];
  leaveRequests: LeaveRequestRecord[];
  transfers: WorkforceTransferRecord[];
  forecasts: StaffingForecastRecord[];
  updatedAt: string;
};

function defaultState(): WorkforceManagementState {
  return {
    profiles: [...WORKFORCE_PROFILE_SEED],
    availability: [...WORKFORCE_AVAILABILITY_SEED],
    capacity: [...WORKFORCE_CAPACITY_SEED],
    assignments: [...WORKFORCE_ASSIGNMENT_SEED],
    regionalAssignments: [...WORKFORCE_REGIONAL_SEED],
    leaveRequests: [...WORKFORCE_LEAVE_SEED],
    transfers: [...WORKFORCE_TRANSFER_SEED],
    forecasts: [...WORKFORCE_FORECAST_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): WorkforceManagementState {
  const stored = readJson<WorkforceManagementState>(STORAGE_KEY, defaultState());
  if (!stored?.profiles?.length) return defaultState();
  return stored;
}

function saveState(state: WorkforceManagementState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

export function listWorkforceProfiles(): WorkforceProfileRecord[] {
  return loadState().profiles;
}

export function listWorkforceAvailability(): WorkforceAvailabilitySlot[] {
  return loadState().availability;
}

export function listWorkforceCapacity(): ConsultantCapacityRecord[] {
  return loadState().capacity;
}

export function listWorkforceAssignments(): ConsultantAssignmentRecord[] {
  return loadState().assignments;
}

export function listRegionalAssignments(): RegionalAssignmentRecord[] {
  return loadState().regionalAssignments;
}

export function listLeaveRequests(): LeaveRequestRecord[] {
  return loadState().leaveRequests;
}

export function listWorkforceTransfers(): WorkforceTransferRecord[] {
  return loadState().transfers;
}

export function listStaffingForecasts(): StaffingForecastRecord[] {
  return loadState().forecasts;
}

export function recordWorkforceTransfer(
  input: Omit<WorkforceTransferRecord, "createdAt" | "updatedAt">
): WorkforceTransferRecord {
  const state = loadState();
  const record = buildTransferRecord(input);
  saveState({
    ...state,
    transfers: [record, ...state.transfers]
  });
  appendAuditCenterEvent({
    actor: input.initiatedBy ?? "workforce-system",
    role: "Operations",
    action: "workforce-transfer",
    entity: "consultant",
    entityRef: record.id,
    result: "success",
    ipPlaceholder: "—",
    consultantId: input.toProfileId,
    detail: `Workload transfer ${record.fromProfileId} → ${record.toProfileId} — all domains preserved.`
  });
  return record;
}

export function recordLeaveApproval(leaveId: string, approvedBy: string): LeaveRequestRecord | null {
  const state = loadState();
  const leave = state.leaveRequests.find((item) => item.id === leaveId);
  if (!leave) return null;

  const updated: LeaveRequestRecord = {
    ...leave,
    status: "approved",
    approvedBy,
    approvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  saveState({
    ...state,
    leaveRequests: state.leaveRequests.map((item) => (item.id === leaveId ? updated : item))
  });

  appendAuditCenterEvent({
    actor: approvedBy,
    role: "Operations",
    action: "workforce-leave",
    entity: "consultant",
    entityRef: leaveId,
    result: "success",
    ipPlaceholder: "—",
    detail: `Leave approved (${leave.leaveType}) — capacity automatically reduced.`
  });

  return updated;
}
