import { insertTip } from "../db.js";
import { sendTipPush } from "../firebase.js";
import { broadcastTip } from "../telegram.js";
import { applyPredictionReason, normalizeStartsAtInput } from "../services/publishHelpers.js";
import { enrichTipWithFixture } from "../services/signalWorker.js";

function validateTip(payload) {
  const errors = [];
  if (!payload.match_name) errors.push("match_name is required");
  if (!payload.prediction) errors.push("prediction is required");
  if (!payload.odds) errors.push("odds is required");
  if (typeof payload.is_vip !== "boolean") errors.push("is_vip must be a boolean");
  if (!payload.booking_codes || typeof payload.booking_codes !== "object" || Array.isArray(payload.booking_codes)) {
    errors.push("booking_codes must be an object of bookie names to booking codes");
  }
  return errors;
}

export async function publishTip(req, res, next) {
  try {
    const errors = validateTip(req.body);
    if (errors.length) {
      return res.status(400).json({ ok: false, errors });
    }

    const enrichedTip = await enrichTipWithFixture({
      match_name: String(req.body.match_name),
      league: req.body.league ? String(req.body.league) : "Football",
      prediction: String(req.body.prediction),
      prediction_reason: String(req.body.prediction_reason || req.body.reason || "").trim(),
      odds: String(req.body.odds),
      confidence: req.body.confidence ? Number(req.body.confidence) : null,
      is_vip: Boolean(req.body.is_vip),
      booking_codes: req.body.booking_codes,
      starts_at: normalizeStartsAtInput(req.body.starts_at) || null,
    });
    const tip = await insertTip(applyPredictionReason(enrichedTip, String(req.body.prediction_reason || req.body.reason || "").trim()));

    const [telegram, firebase] = await Promise.allSettled([
      broadcastTip(tip),
      sendTipPush(tip)
    ]);

    return res.status(201).json({
      ok: true,
      tip,
      delivery: {
        telegram: telegram.status === "fulfilled" ? telegram.value : { ok: false, error: telegram.reason.message },
        firebase: firebase.status === "fulfilled" ? firebase.value : { ok: false, error: firebase.reason.message }
      }
    });
  } catch (error) {
    return next(error);
  }
}
