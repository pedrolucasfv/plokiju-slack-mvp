import express from "express";
import dotenv from "dotenv";

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

  // Process asynchronously (just log for MVP).
  setImmediate(() => {
    const event = body?.event;
    if (!event || event.type !== "message") return;
    if (event.bot_id) return;
    if (event.subtype === "bot_message") return;

    const text = typeof event.text === "string" ? event.text : "";
    if (text) {
      console.log("Incoming Slack message:", text);
    } else {
      console.log("Incoming Slack message:", event);
    }
  });
});

app.listen(port, () => {
  console.log(`Slack MVP server listening on http://localhost:${port}`);
});
