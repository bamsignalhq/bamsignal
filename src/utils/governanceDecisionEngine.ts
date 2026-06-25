import type {
  ExecutiveDecisionRecord,
  PolicyAcknowledgementRecord
} from "../types/institutionalGovernance";

export function assertExecutiveDecisionAppendOnly(
  previous: ExecutiveDecisionRecord[],
  next: ExecutiveDecisionRecord[]
): void {
  if (next.length < previous.length) {
    throw new Error("Governance violation: executive decisions cannot be deleted");
  }
  for (let index = 0; index < previous.length; index += 1) {
    const prior = previous[index];
    const current = next[index];
    if (prior.id !== current.id || prior.decisionRef !== current.decisionRef) {
      throw new Error("Governance violation: executive decisions are immutable");
    }
  }
}

export function appendExecutiveDecision(
  decisions: ExecutiveDecisionRecord[],
  input: Omit<ExecutiveDecisionRecord, "createdAt" | "updatedAt">
): ExecutiveDecisionRecord[] {
  const record: ExecutiveDecisionRecord = {
    ...input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const next = [...decisions, record];
  assertExecutiveDecisionAppendOnly(decisions, next);
  return next;
}

export function recordPolicyAcknowledgement(
  existing: PolicyAcknowledgementRecord[],
  input: Omit<PolicyAcknowledgementRecord, "createdAt" | "id"> & { id?: string }
): { acknowledgement: PolicyAcknowledgementRecord; created: boolean; acknowledgements: PolicyAcknowledgementRecord[] } {
  const duplicate = existing.find(
    (item) =>
      item.policyId === input.policyId &&
      item.policyVersion === input.policyVersion &&
      item.operatorEmail.toLowerCase() === input.operatorEmail.toLowerCase()
  );
  if (duplicate) {
    return { acknowledgement: duplicate, created: false, acknowledgements: existing };
  }

  const acknowledgement: PolicyAcknowledgementRecord = {
    ...input,
    id: input.id ?? `policy_ack_${existing.length + 1}`,
    createdAt: new Date().toISOString()
  };
  return {
    acknowledgement,
    created: true,
    acknowledgements: [...existing, acknowledgement]
  };
}
