export type ToolPermission = "READ" | "WRITE" | "EXECUTE";

export type ToolContract = {
  name: string;
  permission: ToolPermission;
  requiresApproval: boolean;
  alphaEnabled: boolean;
  description: string;
};

export const TOOL_CONTRACTS: ToolContract[] = [
  {
    name: "scanProjectReadOnly",
    permission: "READ",
    requiresApproval: false,
    alphaEnabled: true,
    description: "Read-only project scanner.",
  },
  {
    name: "createPlan",
    permission: "READ",
    requiresApproval: false,
    alphaEnabled: true,
    description: "Create reviewable mission plan.",
  },
  {
    name: "applyPatch",
    permission: "WRITE",
    requiresApproval: true,
    alphaEnabled: false,
    description: "Future transactional patch tool. Disabled in Alpha 0.1.",
  },
  {
    name: "runCommand",
    permission: "EXECUTE",
    requiresApproval: true,
    alphaEnabled: false,
    description: "Future sandbox command runner. Disabled in Alpha 0.1.",
  },
];

export function getToolContract(name: string): ToolContract | undefined {
  return TOOL_CONTRACTS.find((tool) => tool.name === name);
}
