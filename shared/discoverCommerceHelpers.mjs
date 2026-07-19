/**
 * Discover commercial products (non-membership).
 * Premium Discover membership remains membershipCommerce.
 * Conversation unlock & profile boost are transactional Discover products.
 */

export const DISCOVER_PRODUCT = Object.freeze({
  CONVERSATION_UNLOCK: "conversation-unlock",
  PROFILE_BOOST: "profile-boost"
});

export const DISCOVER_PRODUCT_EVENT = Object.freeze({
  CONVERSATION_UNLOCKED: "CONVERSATION_UNLOCKED",
  PROFILE_BOOST_ACTIVATED: "PROFILE_BOOST_ACTIVATED"
});

/** Authoritative defaults — server catalog must match. */
export const CONVERSATION_UNLOCK_PRICE_NGN = 500;
export const CONVERSATION_UNLOCK_AMOUNT_KOBO = CONVERSATION_UNLOCK_PRICE_NGN * 100;

export const PROFILE_BOOST_PRICE_NGN = 999;
export const PROFILE_BOOST_DURATION_HOURS = 24;

export function isConversationUnlockProductId(productId) {
  const id = String(productId || "")
    .trim()
    .toLowerCase();
  return (
    id === DISCOVER_PRODUCT.CONVERSATION_UNLOCK ||
    id === "conversation_unlock" ||
    id === "message-unlock" ||
    id === "message_unlock"
  );
}

export function conversationUnlockLabel() {
  return "Conversation Unlock";
}

export function conversationUnlockDescription() {
  return "₦500 unlocks messaging with one specific profile permanently. It does not grant Discover Membership and does not change your daily Signal limits.";
}
