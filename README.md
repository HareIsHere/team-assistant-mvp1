# Team Assistant — MVP 1

A privacy-first Telegram task assistant. The MVP processes only messages sent directly to the bot; it does not read a team's general chat.

## What is included

- User auto-registration by Telegram user ID
- Create a task
- List active tasks
- View latest task
- Update progress
- Block latest task with a reason
- Complete latest task
- Telegram Bot API webhook endpoint
- Optional Telegram webhook secret validation
- PostgreSQL + Prisma
- Local Docker PostgreSQL
- Telegram mock mode when the bot token is absent

## Requirements

- Node.js 20.19+ (Node 24 is also fine)
- npm
- Docker Desktop, if you want local PostgreSQL
- A Telegram bot token from @BotFather

## 1. Create the Telegram bot

In Telegram, open `@BotFather` and run:

```text
/start
/newbot
```

Choose a bot name and username. BotFather will give you:

```text
TELEGRAM_BOT_TOKEN
```

Keep the token secret.

## 2. Install

```bash
npm install
```

## 3. Start PostgreSQL

```bash
docker compose up -d
```

Check:

```bash
npm run test
```

## 4. Environment

Copy `.env.example` to `.env`.

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Set:

```text
TELEGRAM_BOT_TOKEN=your-token-from-botfather
```

For local database, the default `DATABASE_URL` works with the supplied Docker Compose file.

## 5. Create the database schema

```bash
npx prisma migrate dev --name init
```

Then:

```bash
npm run db:generate
```

Open Prisma Studio if desired:

```bash
npm run db:studio
```

## 6. Run the server

```bash
npm run dev
```

Check:

- `http://localhost:3000/`
- `http://localhost:3000/health`

## Telegram webhook

The production endpoint is:

```text
https://YOUR-DOMAIN/webhooks/telegram
```

Configure this URL with Telegram's `setWebhook` method. If `TELEGRAM_WEBHOOK_SECRET` is configured, send the same value as Telegram's `secret_token` when registering the webhook.

Example:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://YOUR-DOMAIN/webhooks/telegram&secret_token=YOUR_SECRET
```

For local development, a public HTTPS tunnel can be used.

## Supported commands

```text
task Payment API
tasks
status
progress 70
progress 80 API hampir selesai
block Menunggu API dari client
done
help
```

The command parser intentionally stays simple in MVP 1. Natural-language AI comes later.

## Security

For an MVP pilot, populate:

```text
ALLOWED_TELEGRAM_IDS=123456789
```

This prevents unknown Telegram accounts from using the bot.

For production, also:

- keep secrets only in Railway Variables or another secret manager
- use `TELEGRAM_WEBHOOK_SECRET`
- keep the allowlist populated during pilot testing
- add rate limiting
- add structured audit logs
- add idempotency for Telegram update IDs
- add automated database backups

## Next phase: MVP 2

MVP 2 should add:

- teams/team members
- daily check-in
- schedule
- reminders
- team status
- daily summary
- weekly summary
- manager dashboard

Do not add AI until the deterministic task workflow is stable.
