import { insertTip } from "../db.js";
import { sendTipPush } from "../firebase.js";
import { broadcastTip } from "../telegram.js";

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

    const tip = await insertTip({
      match_name: String(req.body.match_name),
      prediction: String(req.body.prediction),
      odds: String(req.body.odds),
      is_vip: Boolean(req.body.is_vip),
      booking_codes: req.body.booking_codes,
      starts_at: req.body.starts_at || null,
      stake_hint: req.body.stake_hint || null
    });

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
