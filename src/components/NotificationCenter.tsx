import { Bell, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  getNotifications,
  markAllRead,
  markRead,
  type AppNotification
} from "../utils/notifications";
import { MEMBER_EMPTY_STATES } from "../constants/firstTimeUser";

type NotificationCenterProps = {
  open: boolean;
  onClose: () => void;
  onReadChange?: () => void;
  onOpenNotification?: (notification: AppNotification) => void;
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

export function NotificationCenter({
  open,
  onClose,
  onReadChange,
  onOpenNotification
}: NotificationCenterProps) {
  const [items, setItems] = useState<AppNotification[]>([]);

  const syncItems = useCallback(() => {
    setItems(getNotifications());
  }, []);

  useEffect(() => {
    if (open) syncItems();
  }, [open, syncItems]);

  const handleOpen = (notification: AppNotification) => {
    if (!notification.read) {
      markRead(notification.id);
      syncItems();
      onReadChange?.();
    }
    onOpenNotification?.(notification);
  };

  const handleMarkAllRead = () => {
    markAllRead();
    syncItems();
    onReadChange?.();
  };

  if (!open) return null;

  const hasUnread = items.some((n) => !n.read);

  const panel = (
    <div className="modal-backdrop notification-backdrop" role="presentation" onClick={onClose}>
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
          {items.length === 0 ? (
            <li className="notification-list__empty">
              <strong>{MEMBER_EMPTY_STATES.notifications.title}</strong>
              <span>{MEMBER_EMPTY_STATES.notifications.body}</span>
            </li>
          ) : null}
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className={`notification-item ${n.read ? "" : "unread"}`}
                onClick={() => handleOpen(n)}
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

  return createPortal(panel, document.body);
}
