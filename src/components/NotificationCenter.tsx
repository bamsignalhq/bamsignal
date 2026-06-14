import { Bell, X } from "lucide-react";
import { getNotifications, markAllRead, markRead } from "../utils/notifications";

type NotificationCenterProps = {
  open: boolean;
  onClose: () => void;
};

export function NotificationBell({
  count,
  onClick
}: {
  count: number;
  onClick: () => void;
}) {
  return (
    <button type="button" className="icon-btn notification-bell" onClick={onClick} aria-label="Notifications">
      <Bell size={20} />
      {count > 0 && <span className="notification-bell__badge">{count > 9 ? "9+" : count}</span>}
    </button>
  );
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  if (!open) return null;
  const items = getNotifications();

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="notification-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="notification-panel__head">
          <h3>Notifications</h3>
          <div className="notification-panel__actions">
            {items.some((n) => !n.read) && (
              <button type="button" className="link-btn" onClick={markAllRead}>
                Mark all read
              </button>
            )}
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </header>
        <ul className="notification-list">
          {items.length === 0 && <li className="notification-list__empty">You're all caught up.</li>}
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className={`notification-item ${n.read ? "" : "unread"}`}
                onClick={() => markRead(n.id)}
              >
                <strong>{n.title}</strong>
                <span>{n.body}</span>
                <time dateTime={n.at}>{new Date(n.at).toLocaleString()}</time>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
