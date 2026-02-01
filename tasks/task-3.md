# Task 3 — Plokiju Agents (Slack → Notion Toggle Automation)

You are a senior software engineer.

In this task, you will implement the third real integration of the **Plokiju Agents** project:

**Slack message → automatically add a Toggle in Notion → reply in Slack**

⚠️ There is still NO OpenAI, database, authentication, or dashboard. The focus is only on real API integration and automation.

## Objective

When someone sends a Slack message in the format:

```
[title]: [description]
```

The system must:

1. Receive the event via Slack Events API
2. Parse the message pattern:
   - Before `:` → toggle title
   - After `:` → toggle content
3. Automatically add a **toggle** to a fixed Notion page
4. Reply in Slack confirming:

```
✅ Notion toggle added
```

## Notion context

- Notion allows adding blocks to a page via REST API:
  - `POST /v1/blocks/{block_id}/children`
- Authentication is via Bearer token:
  - `Authorization: Bearer <token>`

## Behavior rules

### Required parsing

Incoming message:

```
Doc: write postmortem
```

Must generate:

- Title: `"Doc"`
- Content: `"write postmortem"`

If there is no `:`, ignore.

If content is empty, ignore.

### Required target page

To add blocks via API, you need the target page ID.

The MVP must use a fixed page defined in `.env`:

```
NOTION_PAGE_ID=
```

The page must be shared with the integration.

### Bot always replies in Slack

After creating the toggle, send:

```
✅ Notion toggle added
```

## Environment variables

Add to `.env.example`:

```env
NOTION_API_KEY=secret_xxxxxxxxxxxxx
NOTION_PAGE_ID=xxxxxxxxxxxxxxxxxxxx

SLACK_BOT_TOKEN=xoxb-xxxx
```

## Implementation spec

1. **Detect Slack messages**
   - Only process:
     - `event.type === "message"`
   - Ignore bots (`bot_id`)

2. **Parse title + content**

```ts
function parseDocMessage(text: string) {
  if (!text.includes(":")) return null

  const [title, ...rest] = text.split(":")
  return {
    title: title.trim(),
    content: rest.join(":").trim(),
  }
}
```

If content is empty, ignore.

3. **Append a Toggle in Notion**

Endpoint:

```
POST https://api.notion.com/v1/blocks/{page_id}/children
```

Required headers:

```
Authorization: Bearer <NOTION_API_KEY>
Notion-Version: 2022-06-28
Content-Type: application/json
```

Notion accepts bearer tokens in the `Authorization` header.

Minimal payload (toggle with paragraph):

```json
{
  "children": [
    {
      "object": "block",
      "type": "toggle",
      "toggle": {
        "rich_text": [
          { "type": "text", "text": { "content": "Doc" } }
        ],
        "children": [
          {
            "object": "block",
            "type": "paragraph",
            "paragraph": {
              "rich_text": [
                { "type": "text", "text": { "content": "write a postmortem..." } }
              ]
            }
          }
        ]
      }
    }
  ]
}
```

4. **Reply in Slack**

Bot replies:

```
✅ Notion toggle added
```

To respond, use `chat.postMessage`.

## File structure

Add files:

```
src/
  notion/
    notion-client.ts       # appendToggle()
  slack/
    slack-handler.ts       # detect Doc: → trigger Notion
.env.example
README.md
```

## Constraints

- ❌ Do NOT use OpenAI
- ❌ Do NOT use database
- ❌ Do NOT implement authentication
- ✅ Only Slack → Notion Toggles integration

## Acceptance criteria

- ✅ Message `Doc: something` creates a toggle in Notion
- ✅ Title is before `:`
- ✅ Content is after `:`
- ✅ Bot replies in Slack confirming
- ✅ Messages without `:` are ignored
- ✅ Project runs locally via `npm run dev`

### Expected output

Terminal:

```
Incoming Slack message: Doc: write postmortem
✅ Notion toggle added
```

Slack channel:

```
✅ Notion toggle added
```

## Deliverables

When finished, provide:

- Files created
- How to create a Notion Integration + token
- How to obtain `NOTION_PAGE_ID`
- How to test by sending a Slack message
