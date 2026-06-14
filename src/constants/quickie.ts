import { getCms } from "../constants/cms";
import { INTENT_OPTIONS } from "../constants/intents";
import type { IntentTag } from "../types";

export function getQuickieUnlockProduct() {
  const cms = getCms();
  return {
    name: "Quickie Chat Pass",
    price: cms.quickiePrice,
    priceLabel: cms.quickiePriceLabel || `₦${cms.quickiePrice.toLocaleString("en-NG")}`,
    amountKobo: cms.quickiePrice * 100,
    description: "Continue chatting after your first message. Quickie matches are private and intent-matched only."
  };
}

/** @deprecated Use getQuickieUnlockProduct() */
export const QUICKIE_CHAT_UNLOCK = {
  get name() {
    return getQuickieUnlockProduct().name;
  },
  get price() {
    return getQuickieUnlockProduct().price;
  },
  get priceLabel() {
    return getQuickieUnlockProduct().priceLabel;
  },
  get amountKobo() {
    return getQuickieUnlockProduct().amountKobo;
  },
  get description() {
    return getQuickieUnlockProduct().description;
  }
};

export function isQuickieMode(intents: IntentTag[] | undefined): boolean {
  return Boolean(intents?.includes("Quickie"));
}

export function quickieIntentOption() {
  return INTENT_OPTIONS.find((o) => o.id === "Quickie");
}
