declare module "../../shared/discoverCommerceHelpers.mjs" {
  export const DISCOVER_PRODUCT: Readonly<{
    CONVERSATION_UNLOCK: string;
    PROFILE_BOOST: string;
  }>;
  export const DISCOVER_PRODUCT_EVENT: Readonly<{
    CONVERSATION_UNLOCKED: string;
    PROFILE_BOOST_ACTIVATED: string;
  }>;
  export const CONVERSATION_UNLOCK_PRICE_NGN: number;
  export const CONVERSATION_UNLOCK_AMOUNT_KOBO: number;
  export const PROFILE_BOOST_PRICE_NGN: number;
  export const PROFILE_BOOST_DURATION_HOURS: number;
  export function isConversationUnlockProductId(productId?: string): boolean;
  export function conversationUnlockLabel(): string;
  export function conversationUnlockDescription(): string;
}

declare module "*/shared/discoverCommerceHelpers.mjs" {
  export const DISCOVER_PRODUCT: Readonly<{
    CONVERSATION_UNLOCK: string;
    PROFILE_BOOST: string;
  }>;
  export const DISCOVER_PRODUCT_EVENT: Readonly<{
    CONVERSATION_UNLOCKED: string;
    PROFILE_BOOST_ACTIVATED: string;
  }>;
  export const CONVERSATION_UNLOCK_PRICE_NGN: number;
  export const CONVERSATION_UNLOCK_AMOUNT_KOBO: number;
  export const PROFILE_BOOST_PRICE_NGN: number;
  export const PROFILE_BOOST_DURATION_HOURS: number;
  export function isConversationUnlockProductId(productId?: string): boolean;
  export function conversationUnlockLabel(): string;
  export function conversationUnlockDescription(): string;
}
