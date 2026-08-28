import { z } from "zod";

export const TriageOutput = z.object({
  category: z.enum(["work", "personal", "learning", "health", "other"]),
  priority: z.enum(["low", "medium", "high"]),
  confidence: z.number().min(0).max(1),
  reason: z.string().max(200),
});

export const STUB_RESPONSE = {
  category: "other",
  priority: "medium",
  confidence: 0.5,
  reason: "Stub mode — no model call made.",
};
