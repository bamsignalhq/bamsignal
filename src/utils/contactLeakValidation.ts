import { CONTACT_LEAK_BLOCK_MESSAGE, scanTextForContactLeak } from "./contactGuard";

export { CONTACT_LEAK_BLOCK_MESSAGE };

export function contactLeakError(text: string, allowContactExchange = false): string | null {
  if (scanTextForContactLeak(text, { allowContactExchange }).blocked) {
    return CONTACT_LEAK_BLOCK_MESSAGE;
  }
  return null;
}
