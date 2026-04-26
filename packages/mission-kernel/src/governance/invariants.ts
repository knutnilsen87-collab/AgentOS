import type { Mission } from "../types/core.js";
import type { Plan } from "../types/plan.js";

export function assertMissionHasGoal(mission: Mission): void {
  if (!mission.goal.trim()) {
    throw new Error("INV-007 violation: Every mission must have a goal.");
  }
}

export function assertNoWriteInReadOnly(mission: Mission, writeRequired: boolean): void {
  if (mission.approvalMode === "READ_ONLY" && writeRequired) {
    throw new Error("INV-001 violation: No write allowed in READ_ONLY mode.");
  }
}

export function assertPlanIsReviewable(plan: Plan): void {
  if (!plan.verificationContract) {
    throw new Error("INV-003 violation: Plan requires verification contract.");
  }

  if (!plan.risks.length) {
    throw new Error("INV-008 violation: Plan must declare risk.");
  }

  if (!plan.assumptions) {
    throw new Error("INV-006 violation: Plan must declare assumptions array.");
  }

  if (!Array.isArray(plan.affectedFiles)) {
    throw new Error("INV-008 violation: Plan must declare affected files.");
  }
}
