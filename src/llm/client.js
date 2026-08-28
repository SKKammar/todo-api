import OpenAI from "openai";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const PROMPT = readFileSync(join(__dir, "../../prompts/triage-v1.md"), "utf8");
export const PROMPT_VERSION = "triage-v1";

const openai = new OpenAI({
  baseURL: process.env.LLM_BASE_URL,
  apiKey: process.env.LLM_API_KEY,
  timeout: 30_000, // 30 s — never leave the SDK default of 10 min
  maxRetries: 0, // we handle retries ourselves in Stage 4
});

export async function callModel(userText, repairHint = null) {
  const start = Date.now();
  const messages = [
    { role: "system", content: PROMPT },
    // User content in a SEPARATE message — never concatenated into the system prompt
    { role: "user", content: JSON.stringify({ text: userText }) },
  ];
  if (repairHint) {
    messages.push({ role: "user", content: repairHint });
  }

  const response = await openai.chat.completions.create({
    model: process.env.LLM_MODEL,
    temperature: 0.1, // low = consistent shape, not creative
    messages,
  });

  return {
    raw: response.choices[0].message.content,
    usage: response.usage,
    durationMs: Date.now() - start,
    promptVersion: PROMPT_VERSION,
    model: process.env.LLM_MODEL,
  };
}

const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);
const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function callWithRetry(userText, repairHint = null) {
  const delays = [1000, 2000, 4000]; // exponential backoff + jitter applied below
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      return await callModel(userText, repairHint);
    } catch (err) {
      const status = err.status ?? 0;
      const isLast = attempt === delays.length;

      // Never retry auth or bad-request errors
      if ([400, 401, 403].includes(status)) throw err;

      // Obey Retry-After if present (429 with header)
      if (status === 429 && err.headers?.["retry-after"]) {
        const wait = parseInt(err.headers["retry-after"]) * 1000;
        if (!isLast) {
          await sleep(wait);
          continue;
        }
        throw err;
      }

      if (!RETRYABLE.has(status) || isLast) throw err;
      const jitter = Math.random() * 500;
      await sleep(delays[attempt] + jitter);
    }
  }
}
