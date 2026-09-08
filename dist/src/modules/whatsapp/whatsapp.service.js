import { env } from "../../config/env.js";
export async function sendTextMessage(to, body) {
    if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
        console.log(`[WHATSAPP MOCK -> ${to}]\n${body}`);
        return { mocked: true };
    }
    const url = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
            type: "text",
            text: { preview_url: false, body }
        })
    });
    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`WhatsApp API error ${response.status}: ${detail}`);
    }
    return response.json();
}
export function helpText() {
    return [
        "🤖 *Team Assistant*",
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
//# sourceMappingURL=whatsapp.service.js.map