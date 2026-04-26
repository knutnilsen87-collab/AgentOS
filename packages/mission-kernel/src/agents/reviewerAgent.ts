import type { AgentInput, AgentResult } from "../types/agents.js";
import type { Plan } from "../types/plan.js";

export type ReviewPackage = {
  summary: string;
  affectedFiles: string[];
  risks: Plan["risks"];
  assumptions: string[];
  recommendedActions: string[];
};

export async function reviewerAgent(input: AgentInput<Plan>): Promise<AgentResult<ReviewPackage>> {
  const plan = input.payload;

  return {
    ok: true,
    agent: "REVIEWER",
    correlationId: input.correlationId,
    output: {
      summary: plan.summary,
      affectedFiles: plan.affectedFiles,
      risks: plan.risks,
      assumptions: plan.assumptions,
      recommendedActions: ["approve_plan", "request_rework", "narrow_scope", "cancel_mission"],
    },
    warnings: [],
  };
}
