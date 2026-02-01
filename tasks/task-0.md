# Task 0 — Slack Connection MVP (Local)

You are a senior software engineer. You will implement a local MVP for the Plokiju Agents project, focused exclusively on integrating the Slack Events API to receive real‑time messages.

The goal of this task is to build only the trigger foundation:

**Slack → Webhook → Terminal log**

No agents yet, no OpenAI yet.

## Project context

- Project name: Plokiju Agents
- Initial MVP (Task 0):
  - Run locally with Node.js + TypeScript
  - Expose an HTTP endpoint to receive Slack events
  - Send immediate ACK
  - Log received messages
- Slack sends events via Events API Webhooks and requires URL verification with a challenge.
- Official documentation note:
  - URL verification event: respond with the `challenge` field in plaintext
- Slack sends channel messages via `message.channels` event.
- Events API flow: Slack sends JSON → server ACK → process event

## Requirements (must‑haves)

- Implement a local HTTP server using Node.js + TypeScript
- Use a simple framework (Express or Fastify)
- Create endpoint:
  - `POST /slack/events`
- Implement correctly:
  - ✅ Slack URL verification handshake
  - ✅ Immediate ACK (respond 200 quickly)
  - ✅ Simple async processing (log only)
- Capture only human messages:
  - `event.type === "message"`
  - ignore bot messages (`bot_id`)

## Slack behavior

Slack will send payloads like:

1. **URL Verification**

```json
{
  "type": "url_verification",
  "challenge": "random_string"
}
```

Your server must respond:

```
random_string
```

2. **Message event**

```json
{
  "type": "event_callback",
  "event": {
    "type": "message",
    "text": "Bug: checkout is failing"
  }
}
```

- Official event: `message.channels`

## File structure

Create the project inside a local isolated directory:

```
plokiju-slack-mvp/

src/
  index.ts        # main server
.env.example      # env var example
package.json
tsconfig.json
README.md
```

## Implementation spec

`/slack/events` must:

- Detect `type === "url_verification"` and return `challenge`
- Otherwise:
  - return `200 OK` immediately (ACK)
  - then log the event content

Example:

```ts
console.log("Incoming Slack message:", event.text)
```

Slack requires a fast ACK, otherwise it will resend events.

## Local dev instructions (must include in README)

- Run server:

```
npm run dev
```

- Expose localhost with ngrok:

```
ngrok http 3000
```

- Configure Slack App:
  - Event Subscriptions → Enable
  - Request URL = ngrok URL + `/slack/events`
  - Subscribe to Bot Events: `message.channels`

## Constraints

- Do NOT implement OpenAI yet
- Do NOT implement database
- Do NOT implement authentication
- Do NOT implement queue or worker
- Do NOT create frontend
- Only Slack → webhook → logs

## Acceptance criteria

- ✅ Server runs locally on `localhost:3000`
- ✅ Slack validates Request URL correctly (challenge responded)
- ✅ Messages posted in Slack appear in terminal:

```
Incoming Slack message: Bug: checkout is failing
```

- ✅ Bot events are ignored
- ✅ README contains full Slack App + ngrok setup

## Deliverables

When finished, provide:

- List of files created
- Explanation of the Slack → Webhook flow
- How to run and test locally
