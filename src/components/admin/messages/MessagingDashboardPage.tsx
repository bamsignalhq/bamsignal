import { useCallback, useMemo, useState } from "react";
import {
  INTERNAL_MESSAGING_FEATURES,
  INTERNAL_MESSAGING_FUTURE_KINDS,
  MESSAGE_CHANNELS,
  MESSAGE_TYPES,
  MESSAGE_TYPE_LABELS
} from "../../../constants/internalMessaging";
import {
  INTERNAL_MESSAGING_ADMIN_BRAND,
  INTERNAL_MESSAGING_ADMIN_PATH
} from "../../../constants/internalMessagingAdmin";
import type { MessageChannelId, MessageTypeId } from "../../../constants/internalMessaging";
import { buildInternalMessagingBundle } from "../../../utils/internalMessagingEngine";
import { emptyMessagingFilters } from "../../../utils/internalMessagingLogic";
import { AnnouncementCard } from "./AnnouncementCard";
import { ChannelCard } from "./ChannelCard";
import { EscalationCard } from "./EscalationCard";
import { HandoffCard } from "./HandoffCard";
import { MessageThreadCard } from "./MessageThreadCard";
import { UnreadBadge } from "./UnreadBadge";

export function MessagingDashboardPage() {
  const [filters, setFilters] = useState(() => emptyMessagingFilters());
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildInternalMessagingBundle(filters, selectedMessageId);
  }, [filters, refreshKey, selectedMessageId]);

  const selectedMessage =
    bundle.messages.find((message) => message.id === selectedMessageId) ?? bundle.selectedMessage;

  const handleChannelSelect = useCallback((channelId: MessageChannelId) => {
    setFilters((current) => ({
      ...current,
      channelId: current.channelId === channelId ? "all" : channelId
    }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters(emptyMessagingFilters());
    setSelectedMessageId(null);
  }, []);

  return (
    <div className="internal-messaging-page messaging-dashboard-page">
      <header className="internal-messaging-page__head">
        <div>
          <h2>
            {INTERNAL_MESSAGING_ADMIN_BRAND}
            {bundle.totalUnread > 0 ? <UnreadBadge count={bundle.totalUnread} /> : null}
          </h2>
          <p>
            Institutional communication infrastructure — operations, consultants, support, research,
            leadership, and announcements. Not external tools. Information stays inside BamSignal.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh
        </button>
      </header>

      <section className="messaging-dashboard-page__metrics" aria-label="Messaging metrics">
        {bundle.metrics.map((metric) => (
          <article key={metric.id} className="messaging-metric-chip">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="internal-messaging-page__features">
        <h3>Features</h3>
        <ul>
          {INTERNAL_MESSAGING_FEATURES.map((feature) => (
            <li key={feature.id}>{feature.label}</li>
          ))}
        </ul>
      </section>

      <section className="internal-messaging-page__channels" aria-label="Message channels">
        {MESSAGE_CHANNELS.map((channel) => {
          const summary = bundle.channels.find((item) => item.channelId === channel.id);
          return (
            <ChannelCard
              key={channel.id}
              channelId={channel.id}
              hint={channel.hint}
              messageCount={summary?.messageCount ?? 0}
              unreadCount={summary?.unreadCount ?? 0}
              active={filters.channelId === channel.id}
              onSelect={() => handleChannelSelect(channel.id)}
            />
          );
        })}
      </section>

      <div className="internal-messaging-page__filters">
        <label className="messaging-search-field">
          <span>Search</span>
          <input
            type="search"
            value={filters.query}
            placeholder="Subject, author, body…"
            onChange={(event) => setFilters({ ...filters, query: event.target.value })}
          />
        </label>

        <label className="messaging-search-field">
          <span>Type</span>
          <select
            value={filters.typeId}
            onChange={(event) =>
              setFilters({ ...filters, typeId: event.target.value as MessageTypeId | "all" })
            }
          >
            <option value="all">All types</option>
            {MESSAGE_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {MESSAGE_TYPE_LABELS[type.id]}
              </option>
            ))}
          </select>
        </label>

        <label className="messaging-search-field messaging-search-field--checkbox">
          <input
            type="checkbox"
            checked={filters.unreadOnly}
            onChange={(event) => setFilters({ ...filters, unreadOnly: event.target.checked })}
          />
          <span>Unread only</span>
        </label>

        <button type="button" className="concierge-consultant-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="internal-messaging-page__body">
        <div className="internal-messaging-page__column">
          <section className="internal-messaging-page__list">
            <h3>Messages</h3>
            {bundle.messages.length ? (
              bundle.messages.map((message) => (
                <AnnouncementCard
                  key={message.id}
                  message={message}
                  selected={selectedMessageId === message.id}
                  onSelect={() => setSelectedMessageId(message.id)}
                />
              ))
            ) : (
              <p className="internal-messaging-page__empty">No messages match the current filters.</p>
            )}
          </section>

          <EscalationCard messages={bundle.messages} />
          <HandoffCard messages={bundle.messages} />
        </div>

        <div className="internal-messaging-page__detail">
          {selectedMessage ? (
            <MessageThreadCard message={selectedMessage} />
          ) : (
            <p className="internal-messaging-page__empty">
              Select a message to view thread, read receipt, priority, and department routing.
            </p>
          )}
        </div>
      </div>

      <footer className="internal-messaging-page__future">
        <h3>Future-ready</h3>
        <p>Documented only — not implemented in this release.</p>
        <ul>
          {INTERNAL_MESSAGING_FUTURE_KINDS.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
        <p>Admin path: {INTERNAL_MESSAGING_ADMIN_PATH}</p>
      </footer>
    </div>
  );
}
