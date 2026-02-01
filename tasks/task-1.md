# Task 1 — Plokiju Agents (Slack → Jira Bug Creator)

You are a senior software engineer.

In this task, you will implement the first real automation of the **Plokiju Agents** project:

**Slack message → detect BUG → create Bug issue in Jira → reply in Slack**

⚠️ There is still NO OpenAI, database, authentication, or dashboard. Only real integration + automation.

## Objective

When someone sends a Slack message in the format:

```
Bug: checkout is failing in production
```

The system must:

1. Receive the event via Slack Events API
2. Parse the message pattern:
   - Before `:` → ticket title (summary)
   - After `:` → ticket description
3. Automatically create a **Bug** issue in Jira
4. Reply in Slack confirming creation:

```
✅ Jira Bug created: PROJ-123
```

## Slack context

- You already implemented the endpoint:
  - `POST /slack/events`
- Slack sends messages via `message.channels` event.
- To reply in the channel, use `chat.postMessage`.

## Jira context

- Jira Cloud allows creating issues via REST API:
  - `POST /rest/api/3/issue`
- The `description` field uses the official **ADF (Atlassian Document Format)**.

## Behavior rules (user‑defined)

### Required parsing

Incoming message:

```
Bug: checkout is failing
```

Must generate:

- Summary: `"Bug"`
- Description: `"checkout is failing"`

If there is no `:`, ignore the message.

### Fixed issue type

All created tickets must be:

```
issuetype.name = "Bug"
```

### Bot always replies in Slack

After creating the issue, send:

```
✅ Jira Bug created: PROJ-123
```

Using `chat.postMessage`.

## Environment variables

Add to `.env.example`:

```env
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_API_TOKEN=xxxxxxxxxxxx
JIRA_PROJECT_KEY=PROJ

SLACK_BOT_TOKEN=xoxb-xxxx
```

## Implementation spec

1. **Detect channel messages**
   - Only process:
     - `event.type === "message"`
   - Ignore bots (`bot_id`)

2. **Parse title + description**

```ts
function parseBugMessage(text: string) {
  if (!text.includes(":")) return null

  const [summary, ...rest] = text.split(":")
  return {
    summary: summary.trim(),
    description: rest.join(":").trim(),
  }
}
```

3. **Create Jira Issue (Bug)**

Endpoint:

```
POST /rest/api/3/issue
```

Minimal payload:

```json
{
  "fields": {
    "project": { "key": "PROJ" },
    "summary": "Bug",
    "description": {
      "type": "doc",
      "version": 1,
      "content": [
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "checkout is failing" }
          ]
        }
      ]
    },
    "issuetype": { "name": "Bug" }
  }
}
```

ADF is the official rich‑text format in Jira Cloud.

4. **Reply in Slack**

After Jira returns:

```json
{ "key": "PROJ-123" }
```

Send:

```
✅ Jira Bug created: PROJ-123
```

Use `chat.postMessage`.

## File structure

Add files:

```
src/
  jira/
    jira-client.ts       # createBugIssue()
  slack/
    slack-handler.ts     # parse + trigger Jira
  index.ts               # webhook receiver
.env.example
README.md
```

## Acceptance criteria

- ✅ Message `"Bug: something failed"` creates a Bug issue in Jira
- ✅ Summary is before `:`
- ✅ Description is after `:`
- ✅ Bot replies in Slack with `PROJ-123`
- ✅ Messages without `:` are ignored
- ✅ Project runs locally via `npm run dev`

### Expected output

Terminal:

```
Incoming Slack message: Bug: checkout is failing
✅ Jira Bug created: PROJ-123
```

Slack channel:

```
✅ Jira Bug created: PROJ-123
```

## Deliverables

When finished, provide:

- Files created
- How to generate a Jira API token
- How to test by sending a Slack message
