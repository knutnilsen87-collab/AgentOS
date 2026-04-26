import type { ISODateTime, UUID } from "../types/core.js";

export type ArtifactKind =
  | "PROJECT_PROFILE"
  | "MISSION_PLAN"
  | "REVIEW_PACKAGE"
  | "VERIFICATION_RESULT"
  | "FAILURE_BUNDLE"
  | "HANDOFF";

export type AgentOSArtifact = {
  id: UUID;
  missionId?: UUID;
  projectId?: UUID;
  kind: ArtifactKind;
  title: string;
  createdAt: ISODateTime;
  path?: string;
  data: Record<string, unknown>;
};
