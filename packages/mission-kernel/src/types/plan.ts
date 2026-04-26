import type { ISODateTime, RiskLevel, UUID } from "./core.js";

export type VerificationContract = {
  id: UUID;
  requiredChecks: VerificationCheck[];
  doneRequiresAllRequired: boolean;
};

export type VerificationCheck = {
  id: string;
  title: string;
  type: "STATIC_REVIEW" | "TEST_COMMAND" | "BUILD_COMMAND" | "MANUAL_REVIEW";
  required: boolean;
  command?: string;
  expectedSignal?: string;
};

export type PlanStep = {
  id: string;
  title: string;
  description: string;
  risk: RiskLevel;
  writeRequired: boolean;
  executionRequired: boolean;
  requiresApproval: boolean;
  candidateFiles: string[];
};

export type Plan = {
  id: UUID;
  missionId: UUID;
  createdAt: ISODateTime;
  goal: string;
  summary: string;
  assumptions: string[];
  risks: {
    level: RiskLevel;
    title: string;
    description: string;
  }[];
  affectedFiles: string[];
  steps: PlanStep[];
  verificationContract: VerificationContract;
};

export type VerificationResult = {
  contractId: UUID;
  status: "NOT_RUN" | "PASSED" | "FAILED" | "PARTIAL";
  passed: string[];
  failed: string[];
  notRun: string[];
  confidence: "LOW" | "MEDIUM" | "HIGH";
  doneAllowed: boolean;
};
