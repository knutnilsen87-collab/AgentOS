import type { UUID } from "./core.js";

export type AgentName =
  | "PROJECT_SCANNER"
  | "CONTEXT_BUILDER"
  | "PLANNER"
  | "REVIEWER"
  | "VERIFIER"
  | "MEMORY"
  | "EXPLAINER";

export type AgentInput<T> = {
  correlationId: UUID;
  missionId?: UUID;
  projectId?: UUID;
  payload: T;
};

export type AgentResult<T> =
  | {
      ok: true;
      agent: AgentName;
      correlationId: UUID;
      output: T;
      warnings: string[];
    }
  | {
      ok: false;
      agent: AgentName;
      correlationId: UUID;
      error: {
        code: string;
        message: string;
        invariantId?: string;
      };
    };
