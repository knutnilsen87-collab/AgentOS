import { randomUUID } from "node:crypto";
import type { AgentInput, AgentResult } from "../types/agents.js";
import type { Mission } from "../types/core.js";
import type { ProjectProfile } from "../types/project.js";
import type { Plan } from "../types/plan.js";
import { assertPlanIsReviewable } from "../governance/invariants.js";

export type PlannerInput = {
  mission: Mission;
  projectProfile: ProjectProfile;
};

export async function plannerAgent(input: AgentInput<PlannerInput>): Promise<AgentResult<Plan>> {
  try {
    const { mission, projectProfile } = input.payload;

    const affectedFiles = [
      ...projectProfile.entryPoints,
      ...projectProfile.manifests,
    ];

    const plan: Plan = {
      id: randomUUID(),
      missionId: mission.id,
      createdAt: new Date().toISOString(),
      goal: mission.goal,
      summary: `Reviewable read-only plan for: ${mission.goal}`,
      assumptions: projectProfile.assumptions.map((a) => a.statement),
      risks: projectProfile.riskFlags.map((risk) => ({
        level: risk.level,
        title: risk.title,
        description: risk.description,
      })),
      affectedFiles,
      steps: [
        {
          id: "step_1",
          title: "Review project profile",
          description: "Inspect detected stack, manifests, source roots, and risk flags.",
          risk: "LOW",
          writeRequired: false,
          executionRequired: false,
          requiresApproval: false,
          candidateFiles: projectProfile.manifests,
        },
        {
          id: "step_2",
          title: "Review candidate files",
          description: "Inspect entry points and project manifests before proposing implementation work.",
          risk: "LOW",
          writeRequired: false,
          executionRequired: false,
          requiresApproval: false,
          candidateFiles: affectedFiles,
        },
        {
          id: "step_3",
          title: "Prepare implementation plan",
          description: "Create a more detailed implementation plan after human review of scope and risk.",
          risk: "MEDIUM",
          writeRequired: false,
          executionRequired: false,
          requiresApproval: true,
          candidateFiles: affectedFiles,
        },
      ],
      verificationContract: {
        id: randomUUID(),
        doneRequiresAllRequired: true,
        requiredChecks: [
          {
            id: "check_plan_reviewed",
            title: "Plan reviewed by user",
            type: "MANUAL_REVIEW",
            required: true,
            expectedSignal: "User explicitly approves, rejects, or requests rework.",
          },
          {
            id: "check_no_write_performed",
            title: "No file writes performed in Alpha 0.1",
            type: "STATIC_REVIEW",
            required: true,
            expectedSignal: "Audit log contains no write tool calls.",
          },
        ],
      },
    };

    assertPlanIsReviewable(plan);

    return {
      ok: true,
      agent: "PLANNER",
      correlationId: input.correlationId,
      output: plan,
      warnings: [],
    };
  } catch (error) {
    return {
      ok: false,
      agent: "PLANNER",
      correlationId: input.correlationId,
      error: {
        code: "PLAN_CREATION_FAILED",
        message: error instanceof Error ? error.message : "Unknown planner failure.",
      },
    };
  }
}
