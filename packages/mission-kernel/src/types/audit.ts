import type { ISODateTime, MissionPhase, MissionState, UUID } from "./core.js";

export type AuditEventType =
  | "MISSION_CREATED"
  | "STATE_TRANSITION"
  | "TOOL_CALL_STARTED"
  | "TOOL_CALL_DONE"
  | "TOOL_CALL_FAILED"
  | "AGENT_STARTED"
  | "AGENT_DONE"
  | "AGENT_FAILED"
  | "PLAN_CREATED"
  | "APPROVAL_REQUESTED"
  | "APPROVAL_GRANTED"
  | "APPROVAL_REJECTED"
  | "FAILURE_BUNDLE_CREATED";

export type AuditEvent = {
  timestamp: ISODateTime;
  script_name: string;
  version: string;
  state: MissionState;
  event_type: AuditEventType;
  invariant_id?: string;
  parameters_hash: string;
  exit_code?: number;
  correlation_id: UUID;
  project_id?: UUID;
  mission_id?: UUID;
  phase?: MissionPhase;
  message?: string;
  data?: Record<string, unknown>;
  failure_bundle_ref?: string;
};

export type FailureBundle = {
  id: UUID;
  createdAt: ISODateTime;
  correlationId: UUID;
  action: string;
  parameters: Record<string, unknown>;
  error: {
    code: string;
    message: string;
    stack?: string;
  };
  environment?: Record<string, unknown>;
  auditEventRefs: UUID[];
};
