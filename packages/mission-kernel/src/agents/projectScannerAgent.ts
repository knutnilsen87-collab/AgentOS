import type { AgentInput, AgentResult } from "../types/agents.js";
import type { ProjectProfile } from "../types/project.js";
import { scanProjectReadOnly, type ScanProjectOptions } from "../project/projectScanner.js";

export async function projectScannerAgent(
  input: AgentInput<ScanProjectOptions>
): Promise<AgentResult<ProjectProfile>> {
  try {
    const profile = await scanProjectReadOnly(input.payload);
    return {
      ok: true,
      agent: "PROJECT_SCANNER",
      correlationId: input.correlationId,
      output: profile,
      warnings: profile.riskFlags.map((risk) => risk.title),
    };
  } catch (error) {
    return {
      ok: false,
      agent: "PROJECT_SCANNER",
      correlationId: input.correlationId,
      error: {
        code: "PROJECT_SCAN_FAILED",
        message: error instanceof Error ? error.message : "Unknown project scan failure.",
      },
    };
  }
}
