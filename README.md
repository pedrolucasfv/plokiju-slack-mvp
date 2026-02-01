# Plokiju Agents - Slack Connection MVP (Local)

Minimal local MVP to receive Slack Events API payloads and log human messages.

## What it does

- Exposes `POST /slack/events`
- Responds to Slack URL verification with the `challenge` in plaintext
- ACKs events immediately (HTTP 200)
- Logs human messages (ignores bot messages via `bot_id`)

## Local setup

1) Install dependencies

```bash
cd plokiju-slack-mvp
npm install
```

2) Configure environment

```bash
copy .env.example .env
```

3) Run the server

```bash
npm run dev
```

Server listens on http://localhost:3000

## Expose localhost with ngrok

```bash
ngrok http 3000
```

Use the HTTPS URL from ngrok.

## Configure Slack App

1) Enable **Event Subscriptions**
2) Set **Request URL** to:

```
https://<ngrok-id>.ngrok.app/slack/events
```

3) Subscribe to **Bot Events**:

- `message.channels`

Slack will send a URL verification payload; the server responds with the challenge.

## Expected flow

Slack -> Webhook (/slack/events) -> Immediate ACK -> Log message text

Example log:

```
Incoming Slack message: Bug: checkout is failing
```
