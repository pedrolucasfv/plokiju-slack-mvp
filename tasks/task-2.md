# Task 2 — Plokiju Agents (Slack → GitHub Issue Automation)

You are a senior software engineer.

In this task, you will implement the second real integration of the **Plokiju Agents** project:

**Slack message → create a GitHub issue → reply in Slack**

⚠️ There is still NO OpenAI, database, authentication, or dashboard. The focus is only on real API integration and automation.

## Objective

When someone sends a Slack message in the format:

```
Issue: login button is broken on mobile
```

The system must:

1. Receive the event via Slack Events API
2. Parse the message pattern:
   - Before `:` → issue title (GitHub title)
   - After `:` → issue description (GitHub body)
3. Automatically create a GitHub issue
4. Reply in Slack confirming:

```
✅ GitHub Issue created: #24
```

## GitHub context

- GitHub allows creating issues via REST API:
  - `POST /repos/{owner}/{repo}/issues`
- Minimal payload:

```json
{
  "title": "Issue title",
  "body": "Issue description"
}
```

- Authentication must be via Personal Access Token (PAT).
- GitHub recommends fine‑grained or classic PATs depending on use.

## Behavior rules

### Required parsing

Incoming message:

```
Issue: login button is broken
```

Must generate:

- Title: `"Issue"`
- Body: `"login button is broken"`

If there is no `:`, ignore the message.

### GitHub repo target

The issue must always be created in a fixed repo defined in `.env`:

```
GITHUB_OWNER=
GITHUB_REPO=
```

### Bot always replies in Slack

After creating the issue, send in Slack:

```
✅ GitHub Issue created: #<number>
```

## Environment variables

Add to `.env.example`:

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo

SLACK_BOT_TOKEN=xoxb-xxxx
```

The token needs permission to create issues in the repo.

GitHub provides an `X-Accepted-GitHub-Permissions` header to debug permissions.

## Implementation spec

1. **Detect Slack messages**
   - Only process:
     - `event.type === "message"`
   - Ignore bots (`bot_id`)

2. **Parse title + body**

```ts
function parseIssueMessage(text: string) {
  if (!text.includes(":")) return null

  const [title, ...rest] = text.split(":")
  return {
    title: title.trim(),
    body: rest.join(":").trim(),
  }
}
```

If body is empty, ignore.

3. **Create GitHub issue**

Endpoint:

```
POST https://api.github.com/repos/{owner}/{repo}/issues
```

Headers:

```
Authorization: Bearer <GITHUB_TOKEN>
Accept: application/vnd.github+json
```

The official issues API is documented by GitHub.

4. **Reply in Slack**

GitHub returns:

```json
{
  "number": 24,
  "html_url": "https://github.com/owner/repo/issues/24"
}
```

Bot replies:

```
✅ GitHub Issue created: #24
https://github.com/owner/repo/issues/24
```

## File structure

Add files:

```
src/
  github/
    github-client.ts       # createIssue()
  slack/
    slack-handler.ts       # detect Issue: → trigger GitHub
.env.example
README.md
```

## Constraints

- ❌ Do NOT use OpenAI
- ❌ Do NOT use database
- ❌ Do NOT implement authentication
- ✅ Only Slack → GitHub Issues integration

## Acceptance criteria

- ✅ Message `Issue: something broken` creates a GitHub issue
- ✅ Title is before `:`
- ✅ Body is after `:`
- ✅ Bot replies in Slack with issue number and link
- ✅ Messages without `:` are ignored
- ✅ Project runs locally via `npm run dev`

### Expected output

Terminal:

```
Incoming Slack message: Issue: login broken
✅ GitHub Issue created: #24
```

Slack channel:

```
✅ GitHub Issue created: #24
https://github.com/user/repo/issues/24
```

## Deliverables

When finished, provide:

- Files created
- How to correctly generate a GitHub PAT
- How to test by sending a Slack message
