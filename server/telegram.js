import { Telegraf } from "telegraf";
import { config } from "./config.js";
import { ensureAppUsersTable, query } from "./db.js";

export const bot = config.telegram.botToken ? new Telegraf(config.telegram.botToken) : null;
let commandsRegistered = false;

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0
});

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const adminTelegramHandle = "@ttmaketing";

function bookieLabel(bookie) {
  return bookie.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function normalizeBookingEntry(bookie, rawValue) {
  if (typeof rawValue === "string") {
    const trimmed = String(rawValue || "").trim();
    return {
      label: bookieLabel(bookie),
      code: /^https?:\/\//i.test(trimmed) ? "" : trimmed,
      url: /^https?:\/\//i.test(trimmed) ? trimmed : "",
      buttonText: "",
      actionMode: /^https?:\/\//i.test(trimmed) ? "link" : "code"
    };
  }
  return {
    label: String(rawValue?.label || bookieLabel(bookie)).trim(),
    code: String(rawValue?.code || "").trim(),
    url: String(rawValue?.url || "").trim(),
    buttonText: String(rawValue?.button_text || "").trim(),
    actionMode: String(rawValue?.action_mode || ((rawValue?.code && rawValue?.url) ? "both" : rawValue?.url ? "link" : "code")).trim().toLowerCase()
  };
}

function tipBookingEntries(tip) {
  return Object.entries(tip.booking_codes || {}).map(([bookie, rawValue]) => normalizeBookingEntry(bookie, rawValue));
}

function tipReason(tip) {
  return String(
    tip?.prediction_reason
    || tip?.fixture_payload?.metadata?.public_reason
    || tip?.fixture_payload?.metadata?.prediction_reason
    || tip?.fixture_payload?.metadata?.rationale
    || ""
  ).trim();
}

function formatTipDateTime(tip) {
  if (!tip.starts_at) return "";
  const date = new Date(tip.starts_at);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: config.timezone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(date);
}

function affiliateUrlFor(bookie, tip) {
  const normalized = String(bookie || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const aliases = {
    "1xbet": "1xbet",
    onexbet: "1xbet",
    sportybet: "sportybet",
    bet9ja: "bet9ja",
    betking: "betking",
    betway: "betway",
    melbet: "melbet"
  };
  const key = aliases[normalized] || normalized;
  return "";
}

function primaryAffiliate(tip) {
  const direct = tipBookingEntries(tip).find((entry) => entry.url);
  if (direct) return { label: direct.label, url: direct.url };
  const codeBookie = Object.keys(tip.booking_codes || {}).find((bookie) => affiliateUrlFor(bookie, tip));
  if (codeBookie) return { label: bookieLabel(codeBookie), url: affiliateUrlFor(codeBookie, tip) };
  return null;
}

function bookingButtons(tip) {
  const rows = Object.entries(tip.booking_codes || {}).flatMap(([bookie, rawValue]) => {
    const entry = normalizeBookingEntry(bookie, rawValue);
    const url = entry.url || affiliateUrlFor(bookie, tip);
    const buttons = [];

    if ((entry.actionMode === "code" || entry.actionMode === "both" || (!entry.url && entry.code)) && entry.code) {
      buttons.push({
        text: `Copy ${entry.label} Code`,
        copy_text: { text: String(entry.code) }
      });
    }

    if ((entry.actionMode === "link" || entry.actionMode === "both" || (!entry.code && url)) && url) {
      buttons.push({
        text: entry.buttonText || `Open ${entry.label}`,
        url
      });
    }

    return buttons.length ? [buttons] : [];
  });

  const affiliate = primaryAffiliate(tip);
  if (affiliate && !rows.some((row) => row.some((button) => button.url === affiliate.url))) {
    rows.push([{ text: `Open ${affiliate.label}`, url: affiliate.url }]);
  }

  return rows.length ? { inline_keyboard: rows } : undefined;
}

export function formatTipMessage(tip) {
  const tier = tip.is_vip ? "VIP SIGNAL" : "FREE GAME";
  const kickoff = formatTipDateTime(tip);
  const affiliate = primaryAffiliate(tip);
  const bookingLines = Object.entries(tip.booking_codes || {})
    .map(([bookie, rawValue]) => {
      const entry = normalizeBookingEntry(bookie, rawValue);
      const parts = [];
      if (entry.code) parts.push(`<code>${escapeHtml(entry.code)}</code>`);
      if (entry.url && entry.actionMode !== "code") parts.push(`<a href="${escapeHtml(entry.url)}">Open link</a>`);
      return parts.length ? `• <b>${escapeHtml(entry.label)}</b>: ${parts.join(" / ")}` : "";
    })
    .filter(Boolean)
    .join("\n");

  return [
    `🚀 <b>BamSignal ${tier}</b>`,
    "",
    tip.league ? `🏆 <b>${escapeHtml(tip.league)}</b>` : "",
    kickoff ? `🗓 ${escapeHtml(kickoff)}` : "",
    `⚽ <b>${escapeHtml(tip.match_name)}</b>`,
    `✅ Pick: <b>${escapeHtml(tip.prediction)}</b>`,
    tipReason(tip) ? `🧠 Why: ${escapeHtml(tipReason(tip))}` : "",
    `💰 Odds: <b>${escapeHtml(tip.odds)}</b>`,
    tip.stake_hint ? `Stake: <b>${money.format(Number(tip.stake_hint))}</b>` : "",
    bookingLines ? `\n<b>Booking Codes</b>\n${bookingLines}` : "",
    affiliate ? `🎁 Bonus link: <a href="${escapeHtml(affiliate.url)}">${escapeHtml(affiliate.label)}</a>` : "",
    "",
    tip.is_vip
      ? "Premium members only. Manage risk and stake responsibly."
      : "Free pick posted. Upgrade in the BamSignal app for premium games.",
    `Need help? Message admin: ${escapeHtml(adminTelegramHandle)}`
  ].filter(Boolean).join("\n");
}

export async function broadcastTip(tip) {
  if (!bot) {
    return { ok: false, skipped: true, reason: "TELEGRAM_BOT_TOKEN is not configured" };
  }

  const chatId = tip.is_vip ? config.telegram.vipGroupId : config.telegram.freeChannelId;
  if (!chatId) {
    return { ok: false, skipped: true, reason: "Telegram channel/group id is not configured" };
  }

  const message = await bot.telegram.sendMessage(chatId, formatTipMessage(tip), {
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup: bookingButtons(tip)
  });

  return { ok: true, message_id: message.message_id, chat_id: chatId };
}

export async function postResultProof(tip) {
  const chatId = tip.is_vip ? config.telegram.vipGroupId : config.telegram.freeChannelId;
  if (!bot || !chatId) return { ok: false, skipped: true };
  const won = tip.status === "won";
  const result = tip.result_payload?.score || tip.result_payload?.result || "";
  const message = [
    won ? "✅ <b>WON!</b>" : "❌ <b>Settled: Loss</b>",
    `⚽ ${escapeHtml(tip.match_name)}`,
    `Pick: <b>${escapeHtml(tip.prediction)}</b>`,
    result ? `Result: <b>${escapeHtml(result)}</b>` : "",
    tip.is_vip ? "VIP result logged. BamSignal shows every premium outcome." : "",
    won ? "Our signal hit. Get more structured picks in the BamSignal app." : "We show every result. Transparency builds trust.",
    `Need help? Message admin: ${escapeHtml(adminTelegramHandle)}`
  ].filter(Boolean).join("\n");

  const sent = await bot.telegram.sendMessage(chatId, message, {
    parse_mode: "HTML",
    disable_web_page_preview: true
  });
  return { ok: true, message_id: sent.message_id, chat_id: chatId };
}

export async function postDailyGameResultProof(game) {
  const chatId = game.is_vip ? config.telegram.vipGroupId : config.telegram.freeChannelId;
  if (!bot || !chatId) return { ok: false, skipped: true };
  const won = game.status === "won";
  const result = game.result_payload?.score || game.result_payload?.result || "";
  const message = [
    won ? "✅ <b>BamSignal Result: WON</b>" : "❌ <b>BamSignal Result: Loss</b>",
    `⚽ ${escapeHtml(game.match_name)}`,
    `Pick: <b>${escapeHtml(game.prediction)}</b>`,
    result ? `Result: <b>${escapeHtml(result)}</b>` : "",
    game.is_vip ? "VIP group outcome posted for full transparency." : "Free channel outcome posted for full transparency.",
    `Need help? Message admin: ${escapeHtml(adminTelegramHandle)}`
  ].join("\n");

  const sent = await bot.telegram.sendMessage(chatId, message, {
    parse_mode: "HTML",
    disable_web_page_preview: true
  });
  return { ok: true, message_id: sent.message_id, chat_id: chatId };
}

export async function createVipInviteLink(userId) {
  if (!bot || !config.telegram.vipGroupId) return null;
  const invite = await bot.telegram.createChatInviteLink(config.telegram.vipGroupId, {
    name: `BamSignal VIP ${userId}`,
    creates_join_request: true
  });
  return invite.invite_link;
}

export async function handleVipJoinRequest(ctx) {
  const request = ctx.chatJoinRequest;
  if (!request || String(request.chat?.id) !== String(config.telegram.vipGroupId)) return { ok: false, skipped: true };

  const inviteLink = request.invite_link?.invite_link || "";
  const telegramUserId = String(request.from?.id || "");
  if (!inviteLink || !telegramUserId) {
    await ctx.telegram.declineChatJoinRequest(request.chat.id, request.from.id).catch(() => undefined);
    return { ok: false, declined: true, reason: "missing invite link or user id" };
  }

  await ensureAppUsersTable();
  const result = await query(
    `select id, telegram_user_id
     from app_users
     where telegram_vip_invite_link = $1
       and is_premium = true
       and (premium_until is null or premium_until > now())
     limit 1`,
    [inviteLink]
  );
  const user = result.rows[0];
  const alreadyClaimedByAnother = user?.telegram_user_id && String(user.telegram_user_id) !== telegramUserId;
  if (!user || alreadyClaimedByAnother) {
    await ctx.telegram.declineChatJoinRequest(request.chat.id, request.from.id).catch(() => undefined);
    return { ok: false, declined: true, reason: alreadyClaimedByAnother ? "invite already claimed" : "no active premium user for invite" };
  }

  await ctx.telegram.approveChatJoinRequest(request.chat.id, request.from.id);
  await query(
    `update app_users
     set telegram_user_id = coalesce(telegram_user_id, $2),
         updated_at = now()
     where id = $1`,
    [user.id, telegramUserId]
  );
  return { ok: true, approved: true, user_id: user.id, telegram_user_id: telegramUserId };
}

export function registerBotCommands() {
  if (!bot || commandsRegistered) return;
  commandsRegistered = true;

  bot.command("check_sub", async (ctx) => {
    const telegramUserId = String(ctx.from?.id || "");
    const result = await query(
      "select premium_until from users where telegram_user_id = $1 limit 1",
      [telegramUserId]
    );
    const premiumUntil = result.rows[0]?.premium_until;
    if (!premiumUntil) {
      await ctx.reply("No active BamSignal VIP subscription found for this Telegram account.");
      return;
    }

    const expires = new Date(premiumUntil);
    const days = Math.max(0, Math.ceil((expires.getTime() - Date.now()) / 86400000));
    await ctx.reply(`✅ BamSignal VIP is active. You have ${days} day(s) left.`);
  });

  bot.on("chat_join_request", async (ctx) => {
    await handleVipJoinRequest(ctx).catch((error) => {
      console.error("VIP join request approval failed", {
        message: error.message
      });
    });
  });
}
