# Start Here

This pack has been filled specifically for the **AgentOS** project and made **Codex-ready**.

## What this repository is for
This repository gives you a clean starting point for:
- human onboarding
- Codex onboarding
- phased implementation planning
- safe handoff between sessions and contributors

## Read in this order
1. `status_bundle.txt`
2. `README_MASTER.md`
3. `00_START_HERE/CODEX_FIRST_RUN.md`
4. `02_PRODUCT/PRD_REQUIREMENTS_v1.md`
5. `04_ARCHITECTURE_BACKEND/SYSTEM_ARCHITECTURE_v1.md`
6. `07_POLICY_LEGAL_RISK/SAFETY_AND_APPROVAL_MODEL.md`
7. `AGENTS.md`

## Rules
- `status_bundle.txt` is the primary operational status file.
- `AGENTS.md` is the primary Codex behavior file for the repo.
- `.codex/config.toml` stores project-scoped Codex config.
- `.codex/agents/` stores custom project agents.
- `.agents/skills/` stores repo-scoped skills.
- Do not invent compile/build status until a real scaffold exists.
- Keep docs, status, and implementation aligned.

## Immediate goal
The immediate goal is to let Codex and human contributors start from the same shared truth, then scaffold the first executable version of the system in controlled phases.
