import type { AgentOSResult, Mission, MissionPhase, MissionState } from "../types/core.js";

export type MissionTransition = {
  from: MissionState;
  to: MissionState;
  phase?: MissionPhase;
  reason: string;
};

const allowedTransitions: Record<MissionState, MissionState[]> = {
  NOT_STARTED: ["RUNNING", "BLOCKED", "FAILED"],
  RUNNING: ["AWAITING_APPROVAL", "BLOCKED", "FAILED", "DONE"],
  AWAITING_APPROVAL: ["RUNNING", "BLOCKED", "FAILED"],
  BLOCKED: ["RUNNING", "FAILED"],
  FAILED: [],
  DONE: [],
};

export function canTransition(from: MissionState, to: MissionState): boolean {
  return allowedTransitions[from]?.includes(to) ?? false;
}

export function transitionMissionState(
  mission: Mission,
  transition: MissionTransition
): AgentOSResult<Mission> {
  if (mission.state !== transition.from) {
    return {
      ok: false,
      error: {
        code: "STATE_MISMATCH",
        message: `Mission is ${mission.state}, expected ${transition.from}.`,
        invariantId: "INV-011",
      },
    };
  }

  if (!canTransition(transition.from, transition.to)) {
    return {
      ok: false,
      error: {
        code: "INVALID_STATE_TRANSITION",
        message: `Cannot transition from ${transition.from} to ${transition.to}.`,
        invariantId: "INV-011",
      },
    };
  }

  return {
    ok: true,
    value: {
      ...mission,
      state: transition.to,
      phase: transition.phase ?? mission.phase,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function nextAllowedStates(state: MissionState): MissionState[] {
  return [...(allowedTransitions[state] ?? [])];
}
