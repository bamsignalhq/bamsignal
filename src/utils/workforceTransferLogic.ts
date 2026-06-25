import { WORKFORCE_TRANSFER_DOMAINS } from "../constants/workforceManagement";
import type { WorkforceTransferPayload, WorkforceTransferRecord } from "../types/workforceManagement";

export function assertTransferPayloadComplete(payload: WorkforceTransferPayload): void {
  for (const domain of WORKFORCE_TRANSFER_DOMAINS) {
    if (!Array.isArray(payload[domain])) {
      throw new Error(`Workforce transfer integrity violation: missing ${domain}`);
    }
  }
}

export function assertTransferPayloadImmutable(
  previous: WorkforceTransferPayload,
  next: WorkforceTransferPayload
): void {
  for (const domain of WORKFORCE_TRANSFER_DOMAINS) {
    const prior = previous[domain] ?? [];
    const current = next[domain] ?? [];
    if (current.length < prior.length) {
      throw new Error(`Workforce transfer integrity violation: ${domain} cannot shrink`);
    }
    for (let index = 0; index < prior.length; index += 1) {
      if (prior[index] !== current[index]) {
        throw new Error(`Workforce transfer integrity violation: ${domain} history cannot change`);
      }
    }
  }
}

export function buildTransferRecord(
  input: Omit<WorkforceTransferRecord, "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  }
): WorkforceTransferRecord {
  assertTransferPayloadComplete(input.transferredPayload);
  return {
    ...input,
    createdAt: input.createdAt ?? new Date().toISOString(),
    updatedAt: input.updatedAt ?? new Date().toISOString()
  };
}

export function appendTransferDomainItems(
  record: WorkforceTransferRecord,
  domain: keyof WorkforceTransferPayload,
  items: string[]
): WorkforceTransferRecord {
  const nextPayload = {
    ...record.transferredPayload,
    [domain]: [...(record.transferredPayload[domain] ?? []), ...items]
  };
  assertTransferPayloadImmutable(record.transferredPayload, nextPayload);
  return {
    ...record,
    transferredPayload: nextPayload,
    updatedAt: new Date().toISOString()
  };
}
