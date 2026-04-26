import type { AgentInput, AgentResult } from "../types/agents.js";
import type { ProjectProfile } from "../types/project.js";

export type ContextBuilderOutput = {
  facts: string[];
  assumptions: string[];
  compactSummary: string;
};

export async function contextBuilderAgent(
  input: AgentInput<ProjectProfile>
): Promise<AgentResult<ContextBuilderOutput>> {
  const profile = input.payload;

  return {
    ok: true,
    agent: "CONTEXT_BUILDER",
    correlationId: input.correlationId,
    output: {
      facts: profile.facts.map((fact) => fact.statement),
      assumptions: profile.assumptions.map((assumption) => assumption.statement),
      compactSummary: [
        `Languages: ${profile.languages.join(", ") || "unknown"}`,
        `Frameworks: ${profile.frameworks.join(", ") || "unknown"}`,
        `Manifests: ${profile.manifests.join(", ") || "none"}`,
        `Source roots: ${profile.sourceRoots.join(", ") || "none detected"}`,
      ].join("\n"),
    },
    warnings: [],
  };
}
