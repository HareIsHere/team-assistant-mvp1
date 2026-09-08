import { env, allowedWhatsAppIds } from "../../config/env.js";
import { findOrCreateUser } from "../users/user.service.js";
import { handleCommand } from "./command.service.js";
import { sendTextMessage } from "./whatsapp.service.js";
function extractMessages(body) {
    const result = [];
    for (const entry of body?.entry ?? []) {
        for (const change of entry?.changes ?? []) {
            for (const message of change?.value?.messages ?? [])
                result.push(message);
        }
    }
    return result;
}
export function verifyWebhook(req, res) {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === env.WHATSAPP_VERIFY_TOKEN) {
        return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
}
export async function receiveWebhook(req, res) {
    // Acknowledge quickly; processing can happen after this point.
    res.sendStatus(200);
    try {
        for (const message of extractMessages(req.body)) {
            if (!message.from || message.type !== "text" || !message.text?.body)
                continue;
            if (allowedWhatsAppIds.size > 0 && !allowedWhatsAppIds.has(message.from)) {
                await sendTextMessage(message.from, "Maaf, nomor ini belum diizinkan menggunakan Team Assistant.");
                continue;
            }
            const user = await findOrCreateUser(message.from, message.profile?.name);
            const reply = await handleCommand(user.id, message.text.body);
            await sendTextMessage(message.from, reply);
        }
    }
    catch (error) {
        console.error("Webhook processing failed:", error);
    }
}
//# sourceMappingURL=webhook.controller.js.map