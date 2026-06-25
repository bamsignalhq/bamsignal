import type { ApprovalHistoryRecord, ApprovalRequestRecord } from "../types/institutionalGovernance";

export function assertNotSelfApproval(
  request: ApprovalRequestRecord,
  approverEmail: string
): void {
  if (request.makerEmail.toLowerCase() === approverEmail.toLowerCase()) {
    throw new Error("Governance violation: maker cannot approve their own request");
  }
}

export function processApprovalDecision(
  request: ApprovalRequestRecord,
  history: ApprovalHistoryRecord[],
  input: {
    approverEmail: string;
    decision: ApprovalHistoryRecord["decision"];
    reason?: string;
    comments?: string;
  }
): { request: ApprovalRequestRecord; history: ApprovalHistoryRecord[] } {
  assertNotSelfApproval(request, input.approverEmail);
  const entry: ApprovalHistoryRecord = {
    id: `approval_history_${history.length + 1}`,
    requestId: request.id,
    approverEmail: input.approverEmail,
    decision: input.decision,
    reason: input.reason,
    comments: input.comments,
    decidedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  let status = request.status;
  if (input.decision === "approved") status = "approved";
  if (input.decision === "rejected") status = "rejected";
  if (input.decision === "returned") status = "returned";

  return {
    request: { ...request, status, updatedAt: new Date().toISOString() },
    history: [...history, entry]
  };
}
