import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1),
  WHATSAPP_APP_SECRET: z.string().optional().default(""),
  WHATSAPP_ACCESS_TOKEN: z.string().optional().default(""),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional().default(""),
  WHATSAPP_API_VERSION: z.string().default("v23.0"),
  ALLOWED_WHATSAPP_IDS: z.string().optional().default("")
});

export const env = schema.parse(process.env);

export const allowedWhatsAppIds = new Set(
  env.ALLOWED_WHATSAPP_IDS.split(",").map((v) => v.trim()).filter(Boolean)
);
