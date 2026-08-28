import { Router } from "express";
import { z } from "zod";
import { STUB_RESPONSE } from "../llm/schema.js";
import { callWithRetry, PROMPT_VERSION } from "../llm/client.js";
import { parseAndValidate, quarantine } from "../llm/parse.js";
import { writeLog } from "../llm/logger.js";

const router = Router();

const InputSchema = z.object({
  text: z.string().min(1).max(1000)
});

router.post("/tasks/triage", async (req, res) => {
  const parsed = InputSchema.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return res.status(400).json({
      error: "Invalid input",
      field: issue.path.join("."),
      message: issue.message
    });
  }

  if (process.env.LLM_STUB === "1") return res.json(STUB_RESPONSE);

  if (process.env.LLM_ENABLED === "false") {
    return res.status(503).json({ error: "LLM feature is currently disabled." });
  }

  const userText = parsed.data.text;
  let repairCount = 0;

  try {
    // First attempt
    const first = await callWithRetry(userText);
    let output;
    
    try {
      output = parseAndValidate(first.raw);
    } catch (validationErr) {
      // One repair attempt — send the model its own broken output + the error
      repairCount = 1;
      const hint = `Your previous answer was rejected: ${validationErr.message}\n\nBroken output: ${first.raw}\n\nReturn ONLY corrected JSON matching the schema.`;
      
      const second = await callWithRetry(userText, hint);
      
      try {
        output = parseAndValidate(second.raw);
      } catch (secondErr) {
        // Both failed — quarantine and return 422. Never crash, never return raw text.
        quarantine({
          input: userText,
          raw: second.raw,
          error: secondErr.message,
          promptVersion: first.promptVersion
        });
        return res.status(422).json({
          error: "Model produced invalid output after one repair attempt.",
          detail: secondErr.message,
        });
      }
    }

    writeLog({
      promptVersion: first.promptVersion,
      model: first.model,
      inputTokens: first.usage?.prompt_tokens ?? 0,
      outputTokens: first.usage?.completion_tokens ?? 0,
      durationMs: first.durationMs,
      repairCount,
    });

    return res.json(output);
  } catch (err) {
    if (err.name === "APIConnectionTimeoutError" || err.status === 504) {
      return res.status(504).json({ error: "Model timed out. Try again shortly." });
    }
    return res.status(502).json({ error: "Model call failed.", detail: err.message });
  }
});

export default router;
