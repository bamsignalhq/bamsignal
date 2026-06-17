export {
  CONTACT_LEAK_BLOCK_MESSAGE,
  scanTextForContactLeak,
  containsContactInText,
  containsDigits,
  containsTelegramOrHandle,
  containsOtherOffPlatform,
  checkOutgoingChatMessage,
  scanProfilePayloadForContactLeak
} from "../../shared/contactGuardCore.mjs";
