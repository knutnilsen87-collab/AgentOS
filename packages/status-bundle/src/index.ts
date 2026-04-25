import type { TaskRunSummary } from '@agentos/shared-types';

export interface StatusBundleInput {
  projectName: string;
  phase: string;
  summary: string[];
  nextActions: string[];
}

export function renderStatusBundle(input: StatusBundleInput): string {
  const lines = [
    `PROJECT: ${input.projectName}`,
    `PHASE: ${input.phase}`,
    '',
    'SUMMARY:',
    ...input.summary.map((item) => `- ${item}`),
    '',
    'NEXT_ACTIONS:',
    ...input.nextActions.map((item) => `- ${item}`),
    ''
  ];

  return lines.join('\n');
}

export function renderTaskRunBundle(projectName: string, phase: string, runSummary: TaskRunSummary): string {
  return renderStatusBundle({
    projectName,
    phase,
    summary: [runSummary.statusHeadline, ...runSummary.whatSystemKnows, ...runSummary.changedSinceLastStep],
    nextActions: [runSummary.nextAction]
  });
}
