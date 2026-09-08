import express from "express";
import crypto from "node:crypto";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { receiveWebhook, verifyWebhook } from "./modules/whatsapp/webhook.controller.js";
const app = express();
app.use(express.json({
    limit: "1mb",
    verify: (req, _res, buf) => {
        req.rawBody = Buffer.from(buf);
    }
}));
app.use("/webhooks/whatsapp", (req, res, next) => {
    if (req.method !== "POST" || !env.WHATSAPP_APP_SECRET)
        return next();
    const signature = req.header("x-hub-signature-256");
    const rawBody = req.rawBody;
    if (!signature || !rawBody)
        return res.sendStatus(401);
    const expected = `sha256=${crypto.createHmac("sha256", env.WHATSAPP_APP_SECRET).update(rawBody).digest("hex")}`;
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
        return res.sendStatus(401);
    next();
});
app.get("/", (_req, res) => {
    res.json({ name: "Team Assistant MVP 1", status: "ok" });
});
app.get("/health", async (_req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({ ok: true, database: "ok" });
    }
    catch {
        res.status(503).json({ ok: false, database: "error" });
    }
});
app.get("/webhooks/whatsapp", verifyWebhook);
app.post("/webhooks/whatsapp", receiveWebhook);
const server = app.listen(env.PORT, () => {
    console.log(`Team Assistant running on http://localhost:${env.PORT}`);
});
async function shutdown() {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
//# sourceMappingURL=server.js.map