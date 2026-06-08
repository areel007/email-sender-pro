# Contact Email API

REST API (Express + TypeScript + Nodemailer) that accepts form input and emails it.

## Install

```bash
npm install
cp .env.example .env   # fill in values
npm run dev            # or: npm run build && npm start
```

## Deploy to Render

1. Push this repo to GitHub.
2. On Render: **New +** → **Blueprint** → select the repo (uses `render.yaml`).
   Or **New Web Service** with: Build `npm install && npm run build`, Start `npm start`.
3. Add the SMTP / mail env vars in the Render dashboard (see `.env.example`).
4. Render injects `PORT` automatically; health check is `/health`.

## Endpoint

`POST /api/contact`

```json
{
  "firstname": "Jane",
  "lastname": "Doe",
  "email": "jane@example.com",
  "message": "Optional message"
}
```

Responses: `200 { ok: true }` · `400` invalid input · `502` send failure.

`GET /health` → `{ ok: true }`

## Libraries

Runtime:
- **express** — HTTP server / routing
- **nodemailer** — SMTP email sending
- **dotenv** — load `.env`
- **zod** — input validation
- **cors** — CORS middleware
- **express-rate-limit** — basic abuse protection

Dev:
- **typescript**, **ts-node-dev**
- **@types/express**, **@types/nodemailer**, **@types/cors**, **@types/node**

## Environment variables

| Var | Description |
|---|---|
| `PORT` | HTTP port (default 3000) |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP port (587 STARTTLS, 465 SSL) |
| `SMTP_SECURE` | `true` for port 465, else `false` |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password / app password |
| `MAIL_FROM` | From address, e.g. `"App <no-reply@x.com>"` |
| `MAIL_TO` | Destination inbox that receives submissions |