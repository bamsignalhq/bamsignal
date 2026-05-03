import { Telegraf } from "telegraf";
import { config } from "./config.js";
import { query } from "./db.js";

export const bot = config.telegram.botToken ? new Telegraf(config.telegram.botToken) : null;

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

function bookieLabel(bookie) {
  return bookie.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function bookingButtons(tip) {
  const rows = Object.entries(tip.booking_codes || {}).flatMap(([bookie, code]) => {
    const normalized = bookie.toLowerCase();
    const url = config.affiliateUrls[normalized];
    const buttons = [
      {
        text: `Copy ${bookieLabel(bookie)} Code`,
        copy_text: { text: String(code) }
      }
    ];

    if (url) {
      buttons.push({
        text: `Open ${bookieLabel(bookie)}`,
        url: `${config.publicAppUrl}/affiliate/${normalized}/${tip.id}`
      });
    }

    return [buttons];
  });

  return rows.length ? { inline_keyboard: rows } : undefined;
}

export function formatTipMessage(tip) {
  const tier = tip.is_vip ? "VIP SIGNAL" : "FREE SURE GAME";
  const bookingLines = Object.entries(tip.booking_codes || {})
    .map(([bookie, code]) => `• <b>${escapeHtml(bookieLabel(bookie))}</b>: <code>${escapeHtml(code)}</code>`)
    .join("\n");

  return [
    `🚀 <b>BamSignal ${tier}</b>`,
    "",
    `⚽ <b>${escapeHtml(tip.match_name)}</b>`,
    `✅ Pick: <b>${escapeHtml(tip.prediction)}</b>`,
    `💰 Odds: <b>${escapeHtml(tip.odds)}</b>`,
    tip.stake_hint ? `Stake: <b>${money.format(Number(tip.stake_hint))}</b>` : "",
    bookingLines ? `\n<b>Booking Codes</b>\n${bookingLines}` : "",
    "",
    tip.is_vip
      ? "Premium members only. Manage risk and stake responsibly."
      : "Register with BamSignal affiliate links for bonus offers and more value alerts."
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
    won ? "Our signal hit. Get more structured picks in the BamSignal app." : "We show every result. Transparency builds trust."
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
    game.is_vip ? "VIP group outcome posted for full transparency." : "Free channel outcome posted for full transparency."
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
    member_limit: 1
  });
  return invite.invite_link;
}

export function registerBotCommands() {
  if (!bot) return;

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
}
