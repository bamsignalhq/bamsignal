import { handleContactNodeRequest } from "../server/services/contactMail.js";

export default function handler(req, res) {
  return handleContactNodeRequest(req, res);
}
