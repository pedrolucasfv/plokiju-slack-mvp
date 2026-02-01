import express from "express";
import dotenv from "dotenv";
import { handleSlackEvent } from "./slack/slack-handler";

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.post("/slack/events", (req, res) => {
  const body = req.body;

  if (body?.type === "url_verification" && typeof body.challenge === "string") {
    res.status(200).send(body.challenge);
    return;
  }

  // ACK immediately so Slack does not retry.
  res.status(200).send();

  // Process asynchronously to avoid Slack timeouts.
  setImmediate(() => {
    handleSlackEvent(body).catch((error) => {
      console.error("Slack event handling error:", error);
    });
  });
});

app.listen(port, () => {
  console.log(`Slack MVP server listening on http://localhost:${port}`);
});
