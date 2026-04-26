import type { AgentInput, AgentResult } from "../types/agents.js";

export async function explainerAgent(
  input: AgentInput<{ text: string; mode?: "simple" | "technical" }>
): Promise<AgentResult<{ explanation: string }>> {
  return {
    ok: true,
    agent: "EXPLAINER",
    correlationId: input.correlationId,
    output: {
      explanation:
        input.payload.mode === "simple"
          ? `Kort forklart: ${input.payload.text}`
          : `Technical explanation: ${input.payload.text}`,
    },
    warnings: [],
  };
}
