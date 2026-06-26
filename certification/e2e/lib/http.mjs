/**
 * Shared HTTP client for production certification.
 */
import { config } from "./config.mjs";

export async function httpJson(path, { method = "GET", body, headers = {}, token } = {}) {
  const url = path.startsWith("http") ? path : `${config.baseUrl}${path}`;
  const requestHeaders = {
    Accept: "application/json",
    ...headers
  };
  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
  }

  return { ok: response.ok, status: response.status, payload, url };
}

export async function memberApi(action, body = {}, token) {
  return httpJson(`/api/member/data?action=${encodeURIComponent(action)}`, {
    method: "POST",
    body,
    token
  });
}

export async function authApi(path, body = {}) {
  return httpJson(path, { method: "POST", body });
}

export async function checkProductionReady() {
  const health = await httpJson("/health");
  const ready = await httpJson("/ready", {
    headers: { "x-diagnostics-secret": config.diagnosticsSecret }
  });
  return {
    health: health.payload,
    ready: ready.payload,
    healthOk: health.ok,
    readyOk: ready.ok
  };
}
