import { env } from "../../config/env.js";
const TELEGRAM_API = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;
export async function sendTextMessage(chatId, body) {
    if (!env.TELEGRAM_BOT_TOKEN) {
        console.log(`[TELEGRAM MOCK -> ${chatId}]\n${body}`);
        return { mocked: true };
    }
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: body
        })
    });
    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Telegram API error ${response.status}: ${detail}`);
    }
    return response.json();
}
export function helpText() {
    return [
        "🤖 Team Assistant",
        "",
        "Perintah yang tersedia:",
        "• task Nama task — buat task",
        "• tasks — lihat task aktif",
        "• progress 70 — update task terakhir",
        "• progress 70 Catatan — update + catatan",
        "• block Alasan — blokir task terakhir",
        "• done — selesaikan task terakhir",
        "• status — lihat task terakhir",
        "• help — bantuan",
        "",
        "Contoh: task Payment API"
    ].join("\n");
}
//# sourceMappingURL=telegram.service.js.map