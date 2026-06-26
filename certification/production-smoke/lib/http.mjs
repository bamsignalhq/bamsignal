import { config } from "../config.mjs";

export async function smokeFetch(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    accept = "application/json, text/html;q=0.9,*/*;q=0.8"
  } = options;

  const url = path.startsWith("http") ? path : `${config.baseUrl}${path}`;
  const started = performance.now();
  const requestHeaders = {
    Accept: accept,
    ...headers
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  let response;
  let text = "";
  let error = null;

  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    text = await response.text();
  } catch (cause) {
    error = cause?.message || String(cause);
    return {
      ok: false,
      status: 0,
      durationMs: Math.round(performance.now() - started),
      url,
      text: "",
      json: null,
      headers: {},
      error
    };
  }

  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    durationMs: Math.round(performance.now() - started),
    url,
    text,
    json,
    headers: Object.fromEntries(response.headers.entries()),
    error: null
  };
}

export function parseBuildMeta(html = "") {
  const match =
    html.match(/<meta[^>]+name=["']bamsignal-build["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']bamsignal-build["']/i);
  return match?.[1]?.trim() || null;
}

export function resolveCommitSha() {
  return config.expectedCommitSha || null;
}

export function extractDeploymentTimestamp(headers = {}, buildId = null) {
  const lastModified = headers["last-modified"];
  if (lastModified) {
    const parsed = Date.parse(lastModified);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }

  const dateHeader = headers.date;
  if (dateHeader) {
    const parsed = Date.parse(dateHeader);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }

  if (buildId && !buildId.includes("__BAMSIGNAL_BUILD__")) {
    return null;
  }

  return null;
}
