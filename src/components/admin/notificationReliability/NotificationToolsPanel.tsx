import { NOTIFICATION_CENTER_TOOLS } from "../../../constants/notificationReliability";
import type { EnterpriseNotificationRecord } from "../../../types/notificationReliability";
import { NotificationCard } from "./NotificationCard";

type NotificationToolsPanelProps = {
  record: EnterpriseNotificationRecord;
  onTool: (tool: (typeof NOTIFICATION_CENTER_TOOLS)[number]["id"]) => void;
  busyTool: string | null;
  previewText: string | null;
};

export function NotificationToolsPanel({ record, onTool, busyTool, previewText }: NotificationToolsPanelProps) {
  return (
    <section className="notification-tools-panel concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Tools</h3>
        <p>Retry, Cancel, Preview, Duplicate, Send Test, and Bulk Send.</p>
      </header>
      <NotificationCard record={record} />
      <div className="notification-tools-panel__actions">
        {NOTIFICATION_CENTER_TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className="concierge-consultant-btn"
            disabled={busyTool === tool.id}
            onClick={() => onTool(tool.id)}
          >
            {busyTool === tool.id ? "Working…" : tool.label}
          </button>
        ))}
      </div>
      {previewText ? (
        <div className="notification-tools-panel__preview">
          <h4>Preview</h4>
          <p>{previewText}</p>
        </div>
      ) : null}
      {record.providerResponse ? (
        <div className="notification-tools-panel__provider">
          <h4>Provider response</h4>
          <p>{record.providerResponse}</p>
        </div>
      ) : null}
    </section>
  );
}
