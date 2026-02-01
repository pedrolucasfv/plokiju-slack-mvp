import fetch from "node-fetch";

type BugIssueInput = {
  summary: string;
  description: string;
};

type JiraIssueResponse = {
  key: string;
};

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const buildAdfDescription = (text: string) => ({
  type: "doc",
  version: 1,
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text }],
    },
  ],
});

export async function createBugIssue(input: BugIssueInput): Promise<JiraIssueResponse> {
  const baseUrl = getRequiredEnv("JIRA_BASE_URL").replace(/\/+$/, "");
  const email = getRequiredEnv("JIRA_EMAIL");
  const apiToken = getRequiredEnv("JIRA_API_TOKEN");
  const projectKey = getRequiredEnv("JIRA_PROJECT_KEY");

  const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");

  const response = await fetch(`${baseUrl}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        project: { key: projectKey },
        summary: input.summary,
        description: buildAdfDescription(input.description),
        issuetype: { name: "Bug" },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Jira issue creation failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as JiraIssueResponse;
  return data;
}
