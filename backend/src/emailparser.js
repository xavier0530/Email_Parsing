import fetch from "node-fetch";

/**
 * Minimal email parser:
 * - If OPENAI_API_KEY is set, sends content to OpenAI (placeholder).
 * - Otherwise uses simple regex rules to extract basic structured fields.
 *
 * Extend this to suit your email formats (shipments, deploy notices, invoices).
 */

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

export async function parseEmail({ subject = "", body = "" }) {
  const text = `${subject}\n\n${body}`.trim();

  if (OPENAI_KEY) {
    // Placeholder: call OpenAI's API (you'll want to change to actual model/endpoint and prompt)
    const prompt = `Extract structured fields from this email. Return JSON.\n\n${text}`;
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
      }),
    });
    const json = await resp.json();
    // NOTE: production code should validate json and handle errors
    const content = json?.choices?.[0]?.message?.content || "";
    try {
      return JSON.parse(content);
    } catch {
      return { raw: content };
    }
  }

  // Simple regex-based parsing fallback
  const out = {};
  const reDeployment = /deploy(?:ment)?\s*[:\-]\s*(\S+)/i;
  const reApp = /app(?:lication)?\s*[:\-]\s*(.+)/i;
  const reEnv = /environment\s*[:\-]\s*(\w+)/i;
  const mDeploy = text.match(reDeployment);
  const mApp = text.match(reApp);
  const mEnv = text.match(reEnv);
  if (mDeploy) out.deployment_id = mDeploy[1];
  if (mApp) out.application = mApp[1].trim();
  if (mEnv) out.environment = mEnv[1];

  // Generic date match
  const dateMatch = text.match(/\b(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)\b/);
  if (dateMatch) out.timestamp = dateMatch[1];

  if (Object.keys(out).length === 0) out.raw = text.slice(0, 800);
  return out;
}