import fetch from "node-fetch";
import { createIssue } from "../github/github-client";
import { createBugIssue } from "../jira/jira-client";

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

export function parseMessage(text: string): ParsedMessage | null {
  if (!text.includes(":")) return null;

  const [title, ...rest] = text.split(":");
  return {
    title: title.trim(),
    body: rest.join(":").trim(),
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

  const [jiraIssue, githubIssue] = await Promise.all([
    createBugIssue({ summary: parsed.title, description: parsed.body }),
    createIssue({ title: parsed.title, body: parsed.body }),
  ]);

  console.log(`? Jira Bug created: ${jiraIssue.key}`);
  console.log(`? GitHub Issue created: #${githubIssue.number}`);

  const baseUrl = getRequiredEnv("JIRA_BASE_URL").replace(/\/+$/, "");
  const jiraUrl = `${baseUrl}/browse/${jiraIssue.key}`;

  await postSlackMessage(
    channel,
    `? Jira Bug created: ${jiraIssue.key} ${jiraUrl}\n? GitHub Issue created: #${githubIssue.number} ${githubIssue.html_url}`
  );
}
