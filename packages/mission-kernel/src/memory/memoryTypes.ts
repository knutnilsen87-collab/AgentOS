import type { ISODateTime, UUID } from "../types/core.js";

export type MemoryScope = "GLOBAL" | "PROJECT" | "MISSION" | "SKILL";

export type MemoryEntry = {
  id: UUID;
  scope: MemoryScope;
  projectId?: UUID;
  missionId?: UUID;
  key: string;
  value: string;
  source: "USER" | "MISSION" | "APPROVED_LESSON";
  approved: boolean;
  createdAt: ISODateTime;
};
