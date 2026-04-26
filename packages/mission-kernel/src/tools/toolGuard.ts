import type { Mission } from "../types/core.js";
import { getToolContract } from "./toolContracts.js";

export function assertToolAllowed(mission: Mission, toolName: string): void {
  const contract = getToolContract(toolName);

  if (!contract) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  if (!contract.alphaEnabled) {
    throw new Error(`Tool disabled in Alpha 0.1: ${toolName}`);
  }

  if (mission.scope.deniedTools.includes(toolName)) {
    throw new Error(`Tool denied by mission scope: ${toolName}`);
  }

  if (
    mission.scope.allowedTools.length > 0 &&
    !mission.scope.allowedTools.includes(toolName)
  ) {
    throw new Error(`Tool not included in mission allowedTools: ${toolName}`);
  }

  if (mission.approvalMode === "READ_ONLY" && contract.permission !== "READ") {
    throw new Error(`INV-001 violation: ${toolName} requires ${contract.permission}.`);
  }
}
