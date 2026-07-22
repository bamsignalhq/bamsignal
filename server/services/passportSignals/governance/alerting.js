/**
 * Alerting contracts — interfaces only, swappable notification backend.
 */

import crypto from "node:crypto";
import { logPassportSignalEvent } from "../observability.js";

const alertSubscribers = [];

/** @type {import('./alerting.js').PassportSignalAlertPublisher} */
export const passportSignalAlertPublisher = {
  async publish(alert) {
    return publishSignalAlert(alert);
  }
};

export async function publishSignalAlert(alert) {
  const alertId = `alert_${crypto.randomBytes(6).toString("hex")}`;
  logPassportSignalEvent("passport_signal_alert", {
    alertId,
    alertType: alert.alertType,
    severity: alert.severity,
    headline: alert.headline,
    summary: alert.summary,
    metadata: alert.metadata
  });

  for (const handler of alertSubscribers) {
    try {
      await handler({ alertId, ...alert });
    } catch {
      /* alert subscriber failures must not break governance */
    }
  }

  return { published: true, alertId };
}

export function subscribePassportSignalAlerts(handler) {
  alertSubscribers.push(handler);
  return {
    unsubscribe: () => {
      const index = alertSubscribers.indexOf(handler);
      if (index >= 0) alertSubscribers.splice(index, 1);
    }
  };
}
