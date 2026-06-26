import { useCallback, useEffect, useState } from "react";
import {
  NOTIFICATION_CENTER_REFRESH_INTERVAL_MS,
  NOTIFICATION_RELIABILITY_FUTURE_CAPABILITIES,
  type NotificationQueueId
} from "../../../constants/notificationReliability";
import {
  NOTIFICATION_RELIABILITY_ADMIN_BRAND,
  NOTIFICATION_RELIABILITY_ADMIN_PATH
} from "../../../constants/notificationReliabilityAdmin";
import type { EnterpriseNotificationCenterBundle } from "../../../types/notificationReliability";
import {
  buildLiveNotificationCenterBundle,
  cancelReliabilityNotification,
  duplicateReliabilityNotification,
  previewReliabilityNotification,
  retryReliabilityNotification,
  sendTestReliabilityNotification
} from "../../../utils/notificationReliabilityEngine";
import { filterEnterpriseByQueue } from "../../../utils/notificationReliabilityLogic";
import { FailedDeliveryCard } from "./FailedDeliveryCard";
import { NotificationAuditCard } from "./NotificationAuditCard";
import { NotificationCard } from "./NotificationCard";
import { NotificationCenterSummaryCard } from "./NotificationCenterSummaryCard";
import { NotificationChannelsCard } from "./NotificationChannelsCard";
import { NotificationQueuesCard } from "./NotificationQueuesCard";
import { NotificationTemplatesCard } from "./NotificationTemplatesCard";
import { NotificationToolsPanel } from "./NotificationToolsPanel";
import { RetryQueueCard } from "./RetryQueueCard";

export function NotificationQueuePage() {
  const [bundle, setBundle] = useState<EnterpriseNotificationCenterBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [queueFilter, setQueueFilter] = useState<NotificationQueueId | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [busyTool, setBusyTool] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await buildLiveNotificationCenterBundle();
      setBundle(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, NOTIFICATION_CENTER_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const filteredQueue = bundle
    ? filterEnterpriseByQueue(bundle.all, queueFilter)
    : [];

  const selectedRecord =
    bundle?.all.find((record) => record.id === selectedId) ?? bundle?.all[0] ?? null;

  const handleRetry = useCallback(
    async (recordId: string) => {
      setRetryingId(recordId);
      try {
        const ok = retryReliabilityNotification(recordId);
        setActionMessage(ok ? "Retry queued." : "Retry failed — record not found.");
        await refresh();
      } finally {
        setRetryingId(null);
      }
    },
    [refresh]
  );

  const handleTool = useCallback(
    async (tool: "retry" | "cancel" | "preview" | "duplicate" | "send-test" | "bulk-send") => {
      if (!selectedRecord) return;
      setBusyTool(tool);
      try {
        switch (tool) {
          case "retry":
            await handleRetry(selectedRecord.id);
            break;
          case "cancel":
            cancelReliabilityNotification(selectedRecord.id);
            setActionMessage("Notification cancelled.");
            await refresh();
            break;
          case "preview": {
            const text = previewReliabilityNotification(selectedRecord.id);
            setPreviewText(text);
            setActionMessage("Preview loaded.");
            break;
          }
          case "duplicate":
            duplicateReliabilityNotification(selectedRecord.id);
            setActionMessage("Duplicate queued.");
            break;
          case "send-test":
            sendTestReliabilityNotification(selectedRecord.id);
            setActionMessage("Test send queued to operator inbox.");
            break;
          case "bulk-send":
            setActionMessage("Bulk send wizard reserved for future release.");
            break;
        }
      } finally {
        setBusyTool(null);
      }
    },
    [handleRetry, refresh, selectedRecord]
  );

  return (
    <div className="notification-center-page">
      <header className="notification-center-page__head">
        <div>
          <h2>{NOTIFICATION_RELIABILITY_ADMIN_BRAND}</h2>
          <p>
            Centralized Notification Center — the single source of truth for every outbound
            communication across Email, WhatsApp, Push, In-App, Concierge, and future channels.
            Auto-refreshes every 30 seconds.
          </p>
        </div>
        <button type="button" className="concierge-consultant-btn" onClick={() => void refresh()}>
          {loading ? "Refreshing…" : "Refresh now"}
        </button>
      </header>

      {actionMessage ? <p className="notification-center-page__toast">{actionMessage}</p> : null}

      {bundle ? (
        <>
          <NotificationCenterSummaryCard summary={bundle.summary} />
          <NotificationChannelsCard channels={bundle.channels} />
          <NotificationQueuesCard
            queues={bundle.queueSnapshots}
            activeQueue={queueFilter}
            onSelect={(queueId) => setQueueFilter(queueId as NotificationQueueId | "all")}
          />

          <div className="notification-center-page__queues">
            <section className="notification-queue-panel concierge-consultant-card--glass cc-reveal">
              <header>
                <h3>Active messages</h3>
                <p>
                  {queueFilter === "all"
                    ? "All outbound queues"
                    : bundle.queueSnapshots.find((q) => q.id === queueFilter)?.label}
                </p>
              </header>
              {filteredQueue.length ? (
                <div className="notification-queue-panel__list">
                  {filteredQueue.map((record) => (
                    <NotificationCard
                      key={record.id}
                      record={record}
                      selected={selectedId === record.id}
                      onSelect={() => {
                        setSelectedId(record.id);
                        setPreviewText(null);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="notification-queue-panel__empty">No messages in this queue.</p>
              )}
            </section>

            {selectedRecord ? (
              <NotificationToolsPanel
                record={selectedRecord}
                onTool={(tool) => void handleTool(tool)}
                busyTool={busyTool}
                previewText={previewText}
              />
            ) : null}
          </div>

          <div className="notification-center-page__body">
            <FailedDeliveryCard
              records={bundle.failed}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            <RetryQueueCard
              records={bundle.retryQueue}
              onRetry={(recordId) => void handleRetry(recordId)}
              retryingId={retryingId}
            />
          </div>

          <NotificationTemplatesCard templates={bundle.templates} />
          <NotificationAuditCard audit={bundle.audit} />

          <section className="notification-center-page__future concierge-consultant-card--glass cc-reveal">
            <header>
              <h3>Future ready</h3>
              <p>Planned outbound channels for enterprise-grade notification governance.</p>
            </header>
            <ul>
              {NOTIFICATION_RELIABILITY_FUTURE_CAPABILITIES.map((item) => (
                <li key={item.id}>
                  <strong>{item.label}</strong> — {item.description}
                </li>
              ))}
            </ul>
          </section>

          <footer className="notification-center-page__foot">
            <p>Admin path: {NOTIFICATION_RELIABILITY_ADMIN_PATH}</p>
            <p>Generated: {new Date(bundle.generatedAt).toLocaleString()}</p>
          </footer>
        </>
      ) : (
        <p className="notification-center-page__empty">Loading notification center…</p>
      )}
    </div>
  );
}

/** Alias for institutional naming consistency. */
export const EnterpriseNotificationCenterPage = NotificationQueuePage;
