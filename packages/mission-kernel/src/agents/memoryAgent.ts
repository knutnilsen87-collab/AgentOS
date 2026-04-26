import type { AgentInput, AgentResult } from "../types/agents.js";

export type MemorySuggestion = {
  key: string;
  value: string;
  source: "MISSION" | "USER" | "REVIEW";
  requiresApproval: true;
};

export async function memoryAgent(
  input: AgentInput<{ lesson: string }>
): Promise<AgentResult<MemorySuggestion>> {
  return {
    ok: true,
    agent: "MEMORY",
    correlationId: input.correlationId,
    output: {
      key: "lesson_candidate",
      value: input.payload.lesson,
      source: "MISSION",
      requiresApproval: true,
    },
    warnings: ["Memory suggestions require explicit approval."],
  };
}
