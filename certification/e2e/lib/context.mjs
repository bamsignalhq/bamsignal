/**
 * Shared certification run context passed between scenarios.
 */
export function createContext(config) {
  return {
    runId: config.runId,
    baseUrl: config.baseUrl,
    pin: config.pin,
    memberA: null,
    memberB: null,
    journeyId: null,
    threadId: null,
    signalId: null,
    paymentReference: null,
    logs: []
  };
}

export function log(ctx, message, detail) {
  const entry = { at: new Date().toISOString(), message, detail };
  ctx.logs.push(entry);
  console.info(`[cert] ${message}`, detail ?? "");
}
