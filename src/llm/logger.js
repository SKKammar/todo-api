// Twelve-Factor: log to stdout as structured JSON — let the environment route it
export function writeLog({ promptVersion, model, inputTokens, outputTokens, durationMs, repairCount }) {
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    promptVersion,
    model,
    inputTokens,
    outputTokens,
    durationMs,
    repairCount,
    // Rough cost estimate (openrouter free = $0, but good habit to track)
    estimatedUSD: (((inputTokens + outputTokens) / 1_000_000) * 0.15).toFixed(6),
  }));
}
