# Plokiju Agents - Slack -> Jira Bug + GitHub Issue Creator (Local)

Minimal local MVP to receive Slack Events API payloads, create Jira Bug issues and GitHub issues, and respond in Slack.

## What it does

- Exposes `POST /slack/events`
- Responds to Slack URL verification with the `challenge` in plaintext
- ACKs events immediately (HTTP 200)
- Parses messages in the format `Title: description`
- Creates Jira issues with issue type **Bug**
- Creates GitHub issues in a fixed repo
- Responds back in Slack with both links

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

Fill in Jira + GitHub + Slack values in `.env`.

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

## Generate Jira API Token

1) Go to your Atlassian account security page
2) Select **API tokens**
3) Click **Create API token** and copy it
4) Paste into `JIRA_API_TOKEN` in `.env`

## Generate GitHub PAT

1) Go to GitHub **Settings** -> **Developer settings** -> **Personal access tokens**
2) Create a fine-grained or classic token
3) Ensure the token can create issues in the target repo
4) Paste into `GITHUB_TOKEN` in `.env`

## Expected flow

Slack -> Webhook (/slack/events) -> Immediate ACK -> Create Jira Bug + GitHub Issue -> Post Slack confirmation

Example log:

```
Incoming Slack message: Issue: login button is broken
? Jira Bug created: PROJ-123
? GitHub Issue created: #24
```

## Test by sending a Slack message

Send a message in a channel the bot is in:

```
Login button: login button is broken on mobile
```

The bot should reply in the same channel:

```
? Jira Bug created: PROJ-123 https://your-domain.atlassian.net/browse/PROJ-123
? GitHub Issue created: #24 https://github.com/owner/repo/issues/24
```
