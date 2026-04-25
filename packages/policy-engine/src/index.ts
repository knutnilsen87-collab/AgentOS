import type { ApprovalMode, TaskRiskLevel } from '@agentos/shared-types';

const HIGH_RISK_PATTERNS = [
  /delete/i,
  /production/i,
  /deploy/i,
  /secret/i,
  /credential/i,
  /destructive/i,
  /network/i,
  /shell/i,
  /write/i
];

export function getDefaultApprovalMode(): ApprovalMode {
  return 'edit-with-approval';
}

export function classifyTaskRisk(input: string): TaskRiskLevel {
  const normalized = input.trim();

  if (HIGH_RISK_PATTERNS.some((pattern) => pattern.test(normalized)) || normalized.length > 180) {
    return 'high';
  }

  if (normalized.length > 80) {
    return 'medium';
  }

  return 'low';
}

export function requiresExplicitReview(mode: ApprovalMode): boolean {
  return mode !== 'trusted-auto';
}
