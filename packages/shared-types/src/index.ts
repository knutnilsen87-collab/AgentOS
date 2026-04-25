export type ApprovalMode =
  | 'read-only'
  | 'propose-only'
  | 'edit-with-approval'
  | 'trusted-auto'
  | 'routine';

export type TaskRiskLevel = 'low' | 'medium' | 'high';
export type TaskStatus = 'draft' | 'planned' | 'running' | 'needs-review' | 'done' | 'failed';
export type UiDisplayProfile = 'guided' | 'advanced';
export type UiPhase = 'onboarding' | 'projectSummary' | 'missionCompose' | 'plan' | 'execution' | 'review' | 'verification';
export type VerificationStatus = 'pass' | 'pending' | 'fail';
export type ApprovalDecision = 'pending' | 'approved-read-only' | 'approved-for-edits' | 'rework-requested' | 'rejected';
export type LifecycleEventKind = 'created' | 'planned' | 'approved' | 'rework-requested' | 'verified' | 'failed';
export type GitFileStatus = 'added' | 'modified' | 'deleted' | 'renamed' | 'copied' | 'untracked' | 'unknown';

export interface VerificationCheck {
  id: string;
  label: string;
  status: VerificationStatus;
  detail: string;
}

export interface ApprovalState {
  mode: ApprovalMode;
  risk: TaskRiskLevel;
  requiresReview: boolean;
  summary: string;
  decision: ApprovalDecision;
}

export interface LifecycleEvent {
  id: string;
  kind: LifecycleEventKind;
  at: string;
  message: string;
}

export interface GitChangedFile {
  path: string;
  status: GitFileStatus;
  rawStatus: string;
}

export interface GitReviewSummary {
  isRepository: boolean;
  branch: string | null;
  changedFiles: GitChangedFile[];
  hasUncommittedChanges: boolean;
  diffStat: string[];
  error?: string;
}

export interface CommandResult {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  startedAt: string;
  finishedAt: string;
}

export interface PlanStep {
  id: string;
  title: string;
  detail?: string;
}

export interface TaskPlan {
  objective: string;
  approvalMode: ApprovalMode;
  risk: TaskRiskLevel;
  steps: PlanStep[];
  nextAction: string;
}

export interface ProjectSummary {
  rootPath: string;
  manifests: string[];
  languages: string[];
  estimatedFileCount: number;
  topLevelEntries: string[];
}

export interface ReviewPackage {
  statusBundle: string;
  touchedFiles: string[];
  commandLog: string[];
  notes: string[];
}

export interface TaskRunSummary {
  statusHeadline: string;
  whatSystemKnows: string[];
  nextAction: string;
  changedSinceLastStep: string[];
}

export interface TaskRecord {
  id: string;
  prompt: string;
  status: TaskStatus;
  approvalMode: ApprovalMode;
  risk: TaskRiskLevel;
  projectRoot: string;
  createdAt: string;
  updatedAt: string;
  summary?: string;
  approvalDecision?: ApprovalDecision;
  lifecycle?: LifecycleEvent[];
  verificationChecks?: VerificationCheck[];
  plan: TaskPlan;
  projectSummary?: ProjectSummary;
  reviewPackage: ReviewPackage;
  runSummary: TaskRunSummary;
}
