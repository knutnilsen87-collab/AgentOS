import type { AgentInput, AgentResult } from "../types/agents.js";
import type { VerificationContract, VerificationResult } from "../types/plan.js";

export async function verifierAgent(
  input: AgentInput<VerificationContract>
): Promise<AgentResult<VerificationResult>> {
  const contract = input.payload;

  const manualChecks = contract.requiredChecks.filter((check) => check.type === "MANUAL_REVIEW");

  return {
    ok: true,
    agent: "VERIFIER",
    correlationId: input.correlationId,
    output: {
      contractId: contract.id,
      status: "NOT_RUN",
      passed: [],
      failed: [],
      notRun: contract.requiredChecks.map((check) => check.id),
      confidence: manualChecks.length > 0 ? "LOW" : "MEDIUM",
      doneAllowed: false,
    },
    warnings: ["Verification is not executed in Alpha 0.1; manual review required."],
  };
}
