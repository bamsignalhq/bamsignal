/**
 * Governance reporting — operational summaries for admin review.
 */

import { query, isDatabaseReady } from "../../../db.js";
import { listGovernanceActions } from "./actions.js";
import { getReviewQueueCounts } from "./reviewQueue.js";
import { listContributorHealth } from "./contributorHealth.js";

export async function buildGovernanceReport({ sinceHours = 24 } = {}) {
  if (!isDatabaseReady()) {
    return { ok: false, reason: "database_unavailable" };
  }

  const statusCounts = await query(
    `select status, count(*)::int as count
     from passport_trust_signals
     where deleted_at is null
     group by status`
  );

  const recentActions = await listGovernanceActions({ limit: 100 });
  const queueCounts = await getReviewQueueCounts();
  const contributors = await listContributorHealth();

  const actionsInWindow = recentActions.filter((action) => {
    const age = Date.now() - Date.parse(action.occurredAt);
    return age <= sinceHours * 60 * 60 * 1000;
  });

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    sinceHours,
    statusCounts: Object.fromEntries(statusCounts.rows.map((r) => [r.status, r.count])),
    queueCounts,
    actionsInWindow: actionsInWindow.length,
    recentActions: actionsInWindow.slice(0, 20),
    contributorHealth: contributors,
    influencesTrust: false
  };
}
