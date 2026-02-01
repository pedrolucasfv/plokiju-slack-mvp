import fetch from "node-fetch";

type GitHubIssueInput = {
  title: string;
  body: string;
};

type GitHubIssueResponse = {
  number: number;
  html_url: string;
};

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export async function createIssue(
  input: GitHubIssueInput
): Promise<GitHubIssueResponse> {
  const token = getRequiredEnv("GITHUB_TOKEN");
  const owner = getRequiredEnv("GITHUB_OWNER");
  const repo = getRequiredEnv("GITHUB_REPO");

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: input.title,
        body: input.body,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `GitHub issue creation failed (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as GitHubIssueResponse;
  return data;
}
