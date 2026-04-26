export type ISODateTime = string;
export type UUID = string;

export type MissionPhase =
  | "UNDERSTAND"
  | "PLAN"
  | "EXECUTE"
  | "REVIEW"
  | "VERIFY"
  | "LEARN";

export type MissionState =
  | "NOT_STARTED"
  | "RUNNING"
  | "AWAITING_APPROVAL"
  | "BLOCKED"
  | "FAILED"
  | "DONE";

export type ApprovalMode =
  | "READ_ONLY"
  | "REVIEW_BEFORE_WRITE"
  | "SANDBOX_EXECUTE"
  | "OPERATOR";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AgentOSResult<T> =
  | {
      ok: true;
      value: T;
      warnings?: string[];
    }
  | {
      ok: false;
      error: AgentOSError;
    };

export type AgentOSError = {
  code: string;
  message: string;
  invariantId?: string;
  details?: Record<string, unknown>;
};

export type MissionScope = {
  allowedPaths: string[];
  deniedPaths: string[];
  allowedTools: string[];
  deniedTools: string[];
  notes?: string;
};

export type Mission = {
  id: UUID;
  projectId: UUID;
  goal: string;
  phase: MissionPhase;
  state: MissionState;
  approvalMode: ApprovalMode;
  riskLevel: RiskLevel;
  scope: MissionScope;
  planId?: UUID;
  verificationContractId?: UUID;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};
