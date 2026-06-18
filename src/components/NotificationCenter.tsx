import { Bell, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  getNotifications,
  markAllRead,
  markRead,
  type AppNotification
} from "../utils/notifications";

type NotificationCenterProps = {
  open: boolean;
  onClose: () => void;
  onReadChange?: () => void;
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

export function NotificationCenter({ open, onClose, onReadChange }: NotificationCenterProps) {
  const [items, setItems] = useState<AppNotification[]>([]);

  const refresh = useCallback(() => {
    setItems(getNotifications());
    onReadChange?.();
  }, [onReadChange]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const handleMarkRead = (id: string) => {
    markRead(id);
    refresh();
  };

  const handleMarkAllRead = () => {
    markAllRead();
    refresh();
  };

  if (!open) return null;

  const hasUnread = items.some((n) => !n.read);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="notification-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="notification-panel__head">
          <h3>Notifications</h3>
          <div className="notification-panel__actions">
            {hasUnread ? (
              <button type="button" className="link-btn" onClick={handleMarkAllRead}>
                Read all
              </button>
            ) : null}
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
                onClick={() => handleMarkRead(n.id)}
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
