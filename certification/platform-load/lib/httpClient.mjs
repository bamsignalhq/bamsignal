import http from "node:http";
import https from "node:https";

let httpAgent = null;
let httpsAgent = null;
let agentMaxConnections = 0;

export function getLoadCertHttpAgent(maxConnections = 128) {
  if (httpAgent && httpsAgent && agentMaxConnections >= maxConnections) {
    return { httpAgent, httpsAgent };
  }
  httpAgent = new http.Agent({
    keepAlive: true,
    maxSockets: maxConnections,
    maxFreeSockets: Math.min(maxConnections, 64),
    scheduling: "lifo"
  });
  httpsAgent = new https.Agent({
    keepAlive: true,
    maxSockets: maxConnections,
    maxFreeSockets: Math.min(maxConnections, 64),
    scheduling: "lifo"
  });
  agentMaxConnections = maxConnections;
  return { httpAgent, httpsAgent };
}

export function resetLoadCertHttpAgent() {
  httpAgent = null;
  httpsAgent = null;
  agentMaxConnections = 0;
}

export async function loadCertFetch(url, options = {}) {
  const parsed = new URL(String(url));
  const agents = getLoadCertHttpAgent();
  const agent = parsed.protocol === "https:" ? agents.httpsAgent : agents.httpAgent;
  return fetch(url, { ...options, agent });
}
