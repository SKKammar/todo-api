import { appendFileSync, mkdirSync } from "fs";
import { TriageOutput } from "./schema.js";

function extractJSON(raw) {
  // Models often wrap JSON in code fences or add preamble — strip it
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in model output");
  return JSON.parse(match[0]);
}

export function parseAndValidate(raw) {
  const obj = extractJSON(raw);
  const result = TriageOutput.safeParse(obj);
  if (!result.success) throw new Error(result.error.message);
  return result.data;
}

export function quarantine({ input, raw, error, promptVersion }) {
  mkdirSync("logs", { recursive: true });
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    promptVersion,
    input,
    raw,
    error,
  });
  appendFileSync("logs/quarantine.jsonl", line + "\n");
}
