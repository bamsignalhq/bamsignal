import { Network } from "@capacitor/network";
import { Capacitor } from "@capacitor/core";
import { isNativeApp } from "./platform";

type SyncTask = () => Promise<void>;

const pendingUploadRetries: Array<{ id: string; run: SyncTask }> = [];
let networkListenerAttached = false;
let onlineHandler: (() => void) | null = null;

export function queueUploadRetry(id: string, run: SyncTask) {
  if (!isNativeApp()) return;
  const existing = pendingUploadRetries.findIndex((item) => item.id === id);
  if (existing >= 0) pendingUploadRetries[existing] = { id, run };
  else pendingUploadRetries.push({ id, run });
}

export function registerBackgroundOnlineHandler(handler: () => void) {
  onlineHandler = handler;
}

async function flushQueues() {
  while (pendingUploadRetries.length) {
    const task = pendingUploadRetries.shift();
    if (!task) break;
    try {
      await task.run();
    } catch {
      pendingUploadRetries.push(task);
      break;
    }
  }
  onlineHandler?.();
}

export async function initBackgroundSync(): Promise<void> {
  if (!Capacitor.isNativePlatform() || networkListenerAttached) return;
  networkListenerAttached = true;

  const status = await Network.getStatus();
  if (status.connected) await flushQueues();

  await Network.addListener("networkStatusChange", async (event) => {
    if (event.connected) await flushQueues();
  });
}
