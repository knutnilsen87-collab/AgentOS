import type { ApprovalMode, Mission, MissionScope, RiskLevel, UUID } from "../types/core.js";

export function createMission(params: {
  id: UUID;
  projectId: UUID;
  goal: string;
  approvalMode?: ApprovalMode;
  riskLevel?: RiskLevel;
  scope?: Partial<MissionScope>;
  now?: string;
}): Mission {
  const goal = params.goal.trim();

  if (!goal) {
    throw new Error("INV-007 violation: Mission goal is required.");
  }

  const now = params.now ?? new Date().toISOString();

  return {
    id: params.id,
    projectId: params.projectId,
    goal,
    phase: "UNDERSTAND",
    state: "NOT_STARTED",
    approvalMode: params.approvalMode ?? "READ_ONLY",
    riskLevel: params.riskLevel ?? "LOW",
    scope: {
      allowedPaths: params.scope?.allowedPaths ?? ["."],
      deniedPaths: params.scope?.deniedPaths ?? [".git", "node_modules", "dist", "build", ".env"],
      allowedTools: params.scope?.allowedTools ?? ["scanProjectReadOnly", "createPlan"],
      deniedTools: params.scope?.deniedTools ?? ["applyPatch", "runCommand"],
      notes: params.scope?.notes,
    },
    createdAt: now,
    updatedAt: now,
  };
}
