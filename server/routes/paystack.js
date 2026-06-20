import express from "express";
import {
  PAYSTACK_WEBHOOK_MOUNT_PATHS,
  handlePaystackWebhookExpress
} from "../services/paystackWebhookHandler.js";

export const paystackRouter = express.Router();

for (const mountPath of PAYSTACK_WEBHOOK_MOUNT_PATHS) {
  paystackRouter.post(mountPath, handlePaystackWebhookExpress);
}
