import { env, allowedTelegramIds } from "../../config/env.js";
import { findOrCreateUser } from "../users/user.service.js";
import { handleCommand } from "./command.service.js";
import { sendTextMessage } from "./telegram.service.js";
export function extractMessage(update) {
    return update.message ?? null;
}
export async function receiveUpdate(req, res) {
    // Acknowledge quickly so Telegram does not retry the update.
    res.sendStatus(200);
    try {
        const message = extractMessage(req.body);
        if (!message?.from?.id || !message.chat?.id || !message.text)
            return;
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
    }
    catch (error) {
        console.error("Telegram update processing failed:", error);
    }
}
export async function verifyTelegramWebhook(req, res) {
    if (!env.TELEGRAM_WEBHOOK_SECRET)
        return res.sendStatus(404);
    const provided = req.header("x-telegram-bot-api-secret-token");
    if (provided !== env.TELEGRAM_WEBHOOK_SECRET)
        return res.sendStatus(401);
    return res.sendStatus(200);
}
//# sourceMappingURL=webhook.controller.js.map