import {
  handlePaystackWebhookRequest,
  sendPaystackWebhookHttpResponse
} from "../../server/services/paystackWebhookHandler.js";

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  const rawBody = await readRawBody(req);
  const outcome = await handlePaystackWebhookRequest({
    method: req.method,
    rawBody,
    signature: req.headers["x-paystack-signature"]
  });
  return sendPaystackWebhookHttpResponse(res, outcome);
}

export const config = {
  api: {
    bodyParser: false
  }
};
