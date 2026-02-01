import fetch from "node-fetch";
import { createBugIssue } from "../jira/jira-client";

type ParsedBugMessage = {
  summary: string;
  description: string;
};

const SLACK_POST_MESSAGE_URL = "https://slack.com/api/chat.postMessage";

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export function parseBugMessage(text: string): ParsedBugMessage | null {
  if (!text.includes(":")) return null;

  const [summary, ...rest] = text.split(":");
  return {
    summary: summary.trim(),
    description: rest.join(":").trim(),
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

  const parsed = parseBugMessage(text);
  if (!parsed) {
    console.log("Just a regular message, not a bug report");
    return;
  }

  const issue = await createBugIssue(parsed);
  console.log(`✅ Jira Bug created: ${issue.key}`);

  const channel = typeof event.channel === "string" ? event.channel : "";
  if (!channel) return;

  const baseUrl = getRequiredEnv("JIRA_BASE_URL").replace(/\/+$/, "");
  const issueUrl = `${baseUrl}/browse/${issue.key}`;
  await postSlackMessage(
    channel,
    `✅ Jira Bug created: ${issue.key} ${issueUrl}`
  );
}
