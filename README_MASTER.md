# README_MASTER

## Project
Name: AgentOS (working title)
Purpose: Build a desktop-first agentic project operating system that can understand, plan, execute, verify, review, and improve work across code, docs, design, repo workflows, and automation.
Owner: Echo / Norwegian Steel
Primary stack: Electron + React + TypeScript desktop shell with local-first package layers and filesystem-backed `.agentos/` persistence.

## What this repository is
This repository is now a **Codex-ready starter repo with a phase-1 implementation scaffold**.
It contains product definition, architecture guidance, desktop shell code, package boundaries, local persistence conventions, and execution docs for continuing phased implementation.

## Source of truth
Use these files in this order:

1. `status_bundle.txt`
2. `README.md`
3. `README_MASTER.md`
4. `02_PRODUCT/PRD_REQUIREMENTS_v1.md`
5. `04_ARCHITECTURE_BACKEND/SYSTEM_ARCHITECTURE_v1.md`
6. `docs/03_execution/PHASE_1_BUILD_ORDER.md`
7. `docs/03_execution/FIRST_25_CODEX_TASKS.md`
8. `07_POLICY_LEGAL_RISK/SAFETY_AND_APPROVAL_MODEL.md`
9. `AGENTS.md`
10. `09_MACHINE_READABLE/project_manifest.json`

## Current phase
Phase-1 starter repo / desktop shell vertical slice

## Current truth about project maturity
- **Documented:** Yes
- **Architected at high level:** Yes
- **Codex-ready for repo onboarding and planning:** Yes
- **Implementation scaffolded:** Yes
- **First desktop shell vertical slice coded:** Yes
- **Compile-ready in this environment:** Yes, verified with `scripts/validate.ps1`
- **Core smoke checks in this environment:** Yes, verified with `scripts/validate.ps1`
- **Desktop dev launch in this environment:** Starts Vite and Electron processes
- **Production-ready:** No

## Project outcome
The target system should combine:
- local + later cloud agent execution
- safe sandboxing and approval modes
- repo-aware task execution
- multi-agent orchestration
- persistent project memory
- reusable skills / domain packs
- transparent run logs, diff review, replay, and handoff quality

## Recommended reading order for a new contributor
1. `status_bundle.txt`
2. `README.md`
3. `README_MASTER.md`
4. `00_START_HERE/CODEX_FIRST_RUN.md`
5. `02_PRODUCT/PRD_REQUIREMENTS_v1.md`
6. `04_ARCHITECTURE_BACKEND/SYSTEM_ARCHITECTURE_v1.md`
7. `07_POLICY_LEGAL_RISK/SAFETY_AND_APPROVAL_MODEL.md`
8. `AGENTS.md`
9. `.codex/config.toml`

## Working agreements
- Treat `status_bundle.txt` as the primary operational status file.
- Do not claim compile-ready or launch-verified status without real commands.
- Keep documentation, status, and machine-readable files aligned with the code.
- Prefer small, reviewable iterations that strengthen the first end-to-end slice.
- Use conservative approval behavior until validation and review loops are proven locally.
