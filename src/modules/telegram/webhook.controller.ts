import type { Request, Response } from "express";
import { env, allowedTelegramIds } from "../../config/env.js";
import { findOrCreateUser } from "../users/user.service.js";
import { handleCommand } from "./command.service.js";
import { sendTextMessage } from "./telegram.service.js";

type TelegramMessage = {
  message_id?: number;
  from?: {
    id?: number;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
  chat?: {
    id?: number;
    type?: string;
  };
  text?: string;
};

type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
};

export function extractMessage(update: TelegramUpdate): TelegramMessage | null {
  return update.message ?? null;
}

export async function receiveUpdate(req: Request, res: Response) {
  // Acknowledge quickly so Telegram does not retry the update.
  res.sendStatus(200);

  try {
    const message = extractMessage(req.body as TelegramUpdate);
    if (!message?.from?.id || !message.chat?.id || !message.text) return;

    const telegramId = String(message.from.id);

    if (allowedTelegramIds.size > 0 && !allowedTelegramIds.has(telegramId)) {
      await sendTextMessage(message.chat.id, "Maaf, akun Telegram ini belum diizinkan menggunakan Team Assistant.");
      return;
    }

    const displayName = [
      message.from.first_name,
      message.from.last_name
    ].filter(Boolean).join(" ") || message.from.username;

    const user = await findOrCreateUser(telegramId, displayName);
    const reply = await handleCommand(user.id, message.text);
    await sendTextMessage(message.chat.id, reply);
  } catch (error) {
    console.error("Telegram update processing failed:", error);
  }
}

export async function verifyTelegramWebhook(req: Request, res: Response) {
  if (!env.TELEGRAM_WEBHOOK_SECRET) return res.sendStatus(404);

  const provided = req.header("x-telegram-bot-api-secret-token");
  if (provided !== env.TELEGRAM_WEBHOOK_SECRET) return res.sendStatus(401);

  return res.sendStatus(200);
}
