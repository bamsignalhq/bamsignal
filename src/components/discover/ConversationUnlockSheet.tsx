import { X } from "lucide-react";
import { CONVERSATION_UNLOCK_PRODUCT } from "../../constants/conversationUnlock";
import { MONETIZATION_COPY } from "../../constants/copy";

type ConversationUnlockSheetProps = {
  open: boolean;
  onClose: () => void;
  onPurchase: () => void;
  loading?: boolean;
  targetName?: string;
  error?: string | null;
};

export function ConversationUnlockSheet({
  open,
  onClose,
  onPurchase,
  loading,
  targetName = "this member",
  error
}: ConversationUnlockSheetProps) {
  if (!open) return null;

  return (
    <div
      className="profile-boost-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conversation-unlock-title"
    >
      <button
        type="button"
        className="profile-boost-sheet__backdrop"
        onClick={loading ? undefined : onClose}
        aria-label="Close"
      />
      <div className="profile-boost-sheet__panel">
        <header className="profile-boost-sheet__head">
          <div>
            <h2 id="conversation-unlock-title">{CONVERSATION_UNLOCK_PRODUCT.name}</h2>
            <p className="profile-boost-sheet__subtitle">
              ₦500 unlocks messaging with {targetName} permanently — this purchase applies to one
              profile only.
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close" disabled={loading}>
            <X size={20} />
          </button>
        </header>

        <article className="profile-boost-card">
          <div className="profile-boost-card__top">
            <h3>One conversation</h3>
            <span className="profile-boost-card__price">{CONVERSATION_UNLOCK_PRODUCT.priceLabel}</span>
          </div>
          <p className="profile-boost-card__desc">{CONVERSATION_UNLOCK_PRODUCT.description}</p>
          <ul className="premium-center__benefits" style={{ margin: "0.75rem 0" }}>
            <li>Applies only to {targetName} — not every chat</li>
            <li>Permanent unlock for this conversation</li>
            <li>Does not grant Discover Membership</li>
            <li>Does not change daily Signal limits</li>
          </ul>
          {error ? (
            <p className="profile-boost-card__hint" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            className="btn-primary btn-sm profile-boost-card__cta"
            disabled={loading}
            onClick={onPurchase}
          >
            {loading ? MONETIZATION_COPY.checkoutLoading : CONVERSATION_UNLOCK_PRODUCT.cta}
          </button>
        </article>
      </div>
    </div>
  );
}
