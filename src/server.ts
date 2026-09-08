import express from "express";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { receiveUpdate, verifyTelegramWebhook } from "./modules/telegram/webhook.controller.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({ name: "Team Assistant MVP 1", status: "ok", channel: "telegram" });
});

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, database: "ok", channel: "telegram" });
  } catch {
    res.status(503).json({ ok: false, database: "error" });
  }
});

app.get("/webhooks/telegram", verifyTelegramWebhook);
app.post("/webhooks/telegram", receiveUpdate);

const server = app.listen(env.PORT, () => {
  console.log(`Team Assistant running on port ${env.PORT}`);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
