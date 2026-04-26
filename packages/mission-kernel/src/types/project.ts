import type { ISODateTime, UUID, RiskLevel } from "./core.js";

export type Project = {
  id: UUID;
  name: string;
  rootPath: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
};

export type ProjectFact = {
  id: string;
  source: "SCANNER" | "USER" | "MANIFEST" | "CONFIG";
  statement: string;
  evidence?: string[];
};

export type ProjectAssumption = {
  id: string;
  statement: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  basedOn: string[];
};

export type ProjectRiskFlag = {
  id: string;
  level: RiskLevel;
  title: string;
  description: string;
  evidence?: string[];
};

export type ProjectProfile = {
  projectId: UUID;
  generatedAt: ISODateTime;
  languages: string[];
  frameworks: string[];
  packageManagers: string[];
  manifests: string[];
  entryPoints: string[];
  sourceRoots: string[];
  testCommands: string[];
  buildCommands: string[];
  facts: ProjectFact[];
  assumptions: ProjectAssumption[];
  riskFlags: ProjectRiskFlag[];
  filesSeen: number;
};
