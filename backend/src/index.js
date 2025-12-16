import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { parseEmail } from "./emailParser.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// demo email parsing endpoint
app.post("/api/parse-email", async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!subject && !body) return res.status(400).json({ error: "Provide subject or body" });
    const parsed = await parseEmail({ subject, body });
    res.json({ parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "parsing failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});