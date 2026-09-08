# Team Assistant — MVP 1

A privacy-first WhatsApp task assistant. The MVP processes only messages sent to the bot's WhatsApp number; it does not read a team's general chat.

## What is included

- User auto-registration by WhatsApp ID
- Create a task
- List active tasks
- View latest task
- Update progress
- Block latest task with a reason
- Complete latest task
- WhatsApp Cloud API webhook
- Webhook verification
- Optional X-Hub-Signature-256 validation
- PostgreSQL + Prisma
- Local Docker PostgreSQL
- Mock WhatsApp mode when API credentials are absent

## Requirements

- Node.js 20.19+ (Node 24 is also fine)
- npm
- Docker Desktop, if you want local PostgreSQL
- A Meta WhatsApp Business Platform setup for real WhatsApp testing

## 1. Install

```bash
npm install
```

## 2. Start PostgreSQL

```bash
docker compose up -d
```

Check:

```bash
npm run test
```

## 3. Environment

Copy `.env.example` to `.env`.

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

For local database, the default `DATABASE_URL` works with the supplied Docker Compose file.

## 4. Create the database schema

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

## 5. Run the server

```bash
npm run dev
```

Check:

- http://localhost:3000/
- http://localhost:3000/health

## 6. Test without WhatsApp

When `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` are empty, outgoing messages are printed to the terminal instead of sent to Meta.

The easiest first test is to create a small HTTP test payload against the webhook, or later connect a Meta test number.

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

## WhatsApp Cloud API setup

1. Create/use a Meta developer app with WhatsApp Business Platform.
2. Obtain the phone number ID, access token, and app secret.
3. Put them into `.env`.
4. Deploy the server to a public HTTPS URL, or use a tunnel during development.
5. Configure the WhatsApp webhook callback URL:

```text
https://YOUR-DOMAIN/webhooks/whatsapp
```

6. Set the verify token to exactly the same value as `WHATSAPP_VERIFY_TOKEN`.
7. Subscribe to the WhatsApp `messages` webhook field.

The server implements Meta's GET verification flow and POST message handling. It also validates `X-Hub-Signature-256` when `WHATSAPP_APP_SECRET` is configured.

## Important privacy design

The bot is not designed to read a Community's general conversation. It stores only task-management data that is sent to the bot or created by the bot.

## Production hardening before real company use

- Use a secrets manager instead of plain `.env` on the server.
- Require `WHATSAPP_APP_SECRET` and signature validation.
- Keep `ALLOWED_WHATSAPP_IDS` populated during pilot testing.
- Add authentication and role-based access for a future dashboard.
- Add rate limiting and structured audit logs.
- Add idempotency for incoming WhatsApp message IDs before enabling high-volume traffic.
- Add a queue for outbound messages when volume grows.
- Add automated database backups.

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
