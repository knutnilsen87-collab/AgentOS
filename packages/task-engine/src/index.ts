import { classifyTaskRisk } from '@agentos/policy-engine';
import type { ApprovalMode, ProjectSummary, TaskPlan, TaskRiskLevel, TaskRunSummary } from '@agentos/shared-types';

function slug(index: number): string {
  return `step-${index + 1}`;
}

function detailForRisk(risk: TaskRiskLevel, approvalMode: ApprovalMode): string {
  if (risk === 'high') {
    return `High-risk task in ${approvalMode} mode. Produce a plan and stop for review before edits.`;
  }

  if (risk === 'medium') {
    return `Medium-risk task in ${approvalMode} mode. Keep changes scoped and visible.`;
  }

  return `Low-risk task in ${approvalMode} mode. Continue with a conservative local-first flow.`;
}

export function deriveNextAction(risk: TaskRiskLevel, hasProjectSummary: boolean): string {
  if (!hasProjectSummary) {
    return 'Scan a local project to establish the initial context.';
  }

  if (risk === 'high') {
    return 'Review the generated plan and approval state before any file edits.';
  }

  return 'Review the plan, confirm scope, and move into the first implementation step.';
}

export function buildPhaseOnePlan(
  objective: string,
  approvalMode: ApprovalMode,
  projectSummary?: ProjectSummary
): TaskPlan {
  const risk = classifyTaskRisk(objective);
  const nextAction = deriveNextAction(risk, Boolean(projectSummary));

  const steps = [
    {
      id: slug(0),
      title: 'Identify the target project and keep the first pass read-only.',
      detail: projectSummary ? `Project root selected: ${projectSummary.rootPath}` : 'No project selected yet.'
    },
    {
      id: slug(1),
      title: 'Scan the repo to build a minimal project summary.',
      detail: projectSummary
        ? `Found ${projectSummary.estimatedFileCount} files and ${projectSummary.manifests.length} manifest clues.`
        : 'Waiting for the first repo scan.'
    },
    {
      id: slug(2),
      title: 'Translate the prompt into a reviewable task plan.',
      detail: detailForRisk(risk, approvalMode)
    },
    {
      id: slug(3),
      title: 'Persist the task locally for traceability.',
      detail: 'Write the task record into .agentos/tasks/ so the run history remains visible.'
    },
    {
      id: slug(4),
      title: 'Render the plan, approval mode, and next action in the desktop UI.',
      detail: nextAction
    }
  ];

  return {
    objective,
    approvalMode,
    risk,
    steps,
    nextAction
  };
}

export function summarizeTaskRun(plan: TaskPlan, projectSummary?: ProjectSummary): TaskRunSummary {
  const whatSystemKnows = [
    projectSummary ? `Project root: ${projectSummary.rootPath}` : 'Project root is not selected yet.',
    projectSummary ? `Estimated files: ${projectSummary.estimatedFileCount}` : 'Repo has not been scanned yet.',
    `Approval mode: ${plan.approvalMode}`,
    `Task risk: ${plan.risk}`
  ];

  const changedSinceLastStep = [
    'A fresh plan was generated from the latest task prompt.',
    projectSummary ? 'The repo summary is available in the dashboard.' : 'The repo summary is still missing.',
    'The current run is ready to be stored and reviewed.'
  ];

  return {
    statusHeadline: `${plan.risk.toUpperCase()} risk / ${plan.approvalMode} / ${plan.steps.length} planned steps`,
    whatSystemKnows,
    nextAction: plan.nextAction,
    changedSinceLastStep
  };
}
