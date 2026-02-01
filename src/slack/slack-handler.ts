import fetch from "node-fetch";
import { createIssue } from "../github/github-client";
import { createBugIssue } from "../jira/jira-client";
import { appendToggle } from "../notion/notion-client";

type ParsedMessage = {
  title: string;
  body: string;
};

const SLACK_POST_MESSAGE_URL = "https://slack.com/api/chat.postMessage";

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const getNotionPageUrl = (): string => {
  const raw = getRequiredEnv("NOTION_PAGE_ID");
  const match = raw.match(/[0-9a-fA-F]{32}/g);
  const id = match && match.length > 0 ? match[match.length - 1] : raw;
  const compact = id.replace(/-/g, "").toLowerCase();
  return `https://www.notion.so/${compact}`;
};

export function parseMessage(text: string): ParsedMessage | null {
  const parsed = parseDocMessage(text);
  if (!parsed) return null;
  return { title: parsed.title, body: parsed.content };
}

export function parseDocMessage(
  text: string
): { title: string; content: string } | null {
  if (!text.includes(":")) return null;

  const [title, ...rest] = text.split(":");
  return {
    title: title.trim(),
    content: rest.join(":").trim(),
  };
}

async function postSlackMessage(channel: string, text: string): Promise<void> {
  const token = getRequiredEnv("SLACK_BOT_TOKEN");

  const response = await fetch(SLACK_POST_MESSAGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      channel,
      text,
    }),
  });

  const data = (await response.json()) as { ok: boolean; error?: string };
  if (!data.ok) {
    throw new Error(
      `Slack postMessage failed: ${data.error ?? "unknown_error"}`
    );
  }
}

export async function handleSlackEvent(body: any): Promise<void> {
  const event = body?.event;
  if (!event || event.type !== "message") return;
  if (event.bot_id) return;
  if (event.subtype === "bot_message") return;

  const text = typeof event.text === "string" ? event.text : "";
  if (!text) return;
  console.log("Incoming Slack message:", text);

  const channel = typeof event.channel === "string" ? event.channel : "";
  if (!channel) return;

  const parsed = parseMessage(text);
  if (!parsed) {
    console.log("Just a regular message, missing ':'");
    return;
  }

  if (!parsed.body) {
    console.log("Message missing body after ':'");
    return;
  }

  const [jiraIssue, githubIssue, notionToggle] = await Promise.all([
    createBugIssue({ summary: parsed.title, description: parsed.body }),
    createIssue({ title: parsed.title, body: parsed.body }),
    appendToggle({ title: parsed.title, content: parsed.body }),
  ]);

  console.log(`? Jira Bug created: ${jiraIssue.key}`);
  console.log(`? GitHub Issue created: #${githubIssue.number}`);
  console.log(`? Notion toggle added: ${notionToggle.blockId}`);

  const baseUrl = getRequiredEnv("JIRA_BASE_URL").replace(/\/+$/, "");
  const jiraUrl = `${baseUrl}/browse/${jiraIssue.key}`;
  const notionPageUrl = getNotionPageUrl();

  await postSlackMessage(
    channel,
    `? Jira Bug created: ${jiraIssue.key} ${jiraUrl}\n? GitHub Issue created: #${githubIssue.number} ${githubIssue.html_url}\n? Notion toggle added: ${notionPageUrl}`
  );
}
