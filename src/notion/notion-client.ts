import fetch from "node-fetch";

type NotionPageInput = {
  title: string;
  content: string;
};

type NotionToggleResponse = {
  blockId: string;
};

const NOTION_VERSION = "2022-06-28";

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export async function appendToggle(
  input: NotionPageInput
): Promise<NotionToggleResponse> {
  const token = getRequiredEnv("NOTION_API_KEY");
  const rawPageId =
    process.env.NOTION_PAGE_ID || getRequiredEnv("NOTION_PARENT_PAGE_ID");
  const targetPageId = normalizeNotionId(rawPageId);
  if (!targetPageId) {
    throw new Error(
      "Notion page id is invalid. Use NOTION_PAGE_ID with the page id or full URL."
    );
  }

  const requestUrl = `https://api.notion.com/v1/blocks/${targetPageId}/children`;
  console.log(`Notion append URL: ${requestUrl}`);

  const response = await fetch(requestUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        children: [
          {
            object: "block",
            type: "toggle",
            toggle: {
              rich_text: [
                {
                  type: "text",
                  text: { content: input.title },
                },
              ],
              children: [
                {
                  object: "block",
                  type: "paragraph",
                  paragraph: {
                    rich_text: [
                      {
                        type: "text",
                        text: { content: input.content },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Notion toggle creation failed (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as { results?: Array<{ id?: string }> };
  const blockId = data.results?.[0]?.id;
  if (!blockId) {
    throw new Error("Notion toggle creation failed: missing block id");
  }
  return { blockId };
}

const normalizeNotionId = (value: string): string | null => {
  const trimmed = value.trim();
  const hyphenMatches = trimmed.match(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
  );
  if (hyphenMatches && hyphenMatches.length > 0) {
    return hyphenMatches[hyphenMatches.length - 1].toLowerCase();
  }

  const rawMatches = trimmed.match(/[0-9a-fA-F]{32}/g);
  if (!rawMatches || rawMatches.length === 0) {
    return null;
  }

  const raw = rawMatches[rawMatches.length - 1].toLowerCase();
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(
    12,
    16
  )}-${raw.slice(16, 20)}-${raw.slice(20)}`;
};
