import http from "node:http";
import https from "node:https";

let httpAgent = null;
let httpsAgent = null;

function getAgents() {
  if (!httpAgent) {
    httpAgent = new http.Agent({ keepAlive: true, maxSockets: 32, scheduling: "lifo" });
    httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 32, scheduling: "lifo" });
  }
  return { httpAgent, httpsAgent };
}

export async function perfCertFetch(url, options = {}) {
  const parsed = new URL(String(url));
  const { httpAgent: agentHttp, httpsAgent: agentHttps } = getAgents();
  const agent = parsed.protocol === "https:" ? agentHttps : agentHttp;
  return fetch(url, { ...options, agent });
}
