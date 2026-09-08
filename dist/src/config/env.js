import "dotenv/config";
import { z } from "zod";
const schema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().min(1),
    TELEGRAM_BOT_TOKEN: z.string().optional().default(""),
    TELEGRAM_WEBHOOK_SECRET: z.string().optional().default(""),
    ALLOWED_TELEGRAM_IDS: z.string().optional().default("")
});
export const env = schema.parse(process.env);
export const allowedTelegramIds = new Set(env.ALLOWED_TELEGRAM_IDS.split(",").map((v) => v.trim()).filter(Boolean));
//# sourceMappingURL=env.js.map