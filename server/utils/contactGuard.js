export {
  CONTACT_LEAK_BLOCK_MESSAGE,
  VULGAR_CONTENT_BLOCK_MESSAGE,
  scanTextForContactLeak,
  containsContactInText,
  containsDigits,
  containsTelegramOrHandle,
  containsOtherOffPlatform,
  checkOutgoingChatMessage,
  scanProfilePayloadForContactLeak,
  scanTextForProfanity,
  containsProfanity
} from "../../shared/contactGuardCore.mjs";
