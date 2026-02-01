# Plokiju Agents - Slack -> Jira Bug + GitHub Issue + Notion Toggle (Local)

Minimal local MVP to receive Slack Events API payloads, create Jira Bug issues, GitHub issues, and append Notion toggles, and respond in Slack.

## What it does

- Exposes `POST /slack/events`
- Responds to Slack URL verification with the `challenge` in plaintext
- ACKs events immediately (HTTP 200)
- Parses messages in the format `Title: description`
- Creates Jira issues with issue type **Bug**
- Creates GitHub issues in a fixed repo
- Appends a Notion toggle to a fixed page
- Responds back in Slack with all links

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

Fill in Jira + GitHub + Notion + Slack values in `.env`.

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

## Create Notion integration + token

1) Go to **Notion** -> **Settings & members** -> **Integrations**
2) Click **Develop your own integrations**
3) Create a new internal integration
4) Copy the **Internal Integration Token**
5) Paste into `NOTION_API_KEY` in `.env`

## Get NOTION_PAGE_ID

1) Open the page that should receive the toggle in Notion
2) Click **Share** and invite your integration to the page
3) Copy the page URL and extract the page ID (the long hex-like string)
4) Paste into `NOTION_PAGE_ID` in `.env`

## Expected flow

Slack -> Webhook (/slack/events) -> Immediate ACK -> Create Jira Bug + GitHub Issue + Notion Toggle -> Post Slack confirmation

Example log:

```
Incoming Slack message: Issue: login button is broken
? Jira Bug created: PROJ-123
? GitHub Issue created: #24
✅ Notion toggle added: 12345678-1234-1234-1234-1234567890ab
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
✅ Notion toggle added
```
