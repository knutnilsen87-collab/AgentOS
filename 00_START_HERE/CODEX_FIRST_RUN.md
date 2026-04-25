# Codex First Run

This repository has been prepared so Codex can onboard quickly and safely.

## Why these files exist
- `AGENTS.md` gives repo-level durable instructions.
- `.codex/config.toml` provides project-scoped Codex settings.
- `.codex/agents/` contains project-specific subagents.
- `.agents/skills/` contains repo-local reusable workflows.

## Recommended first checks
From the repository root, run:

```bash
codex --ask-for-approval never "Summarize the current instructions."
```

Expected result:
- Codex should acknowledge instructions from `AGENTS.md`.
- If the project is trusted, project-scoped `.codex/config.toml` will also apply.

## Important trust note
Project-scoped `.codex/config.toml` files only load for trusted projects.
If Codex is not using project config, trust the repo in Codex first and rerun the check.

## Safe first prompt
```bash
codex "Read status_bundle.txt, README_MASTER.md, 02_PRODUCT/PRD_REQUIREMENTS_v1.md, 04_ARCHITECTURE_BACKEND/SYSTEM_ARCHITECTURE_v1.md, and AGENTS.md. Summarize the project, identify the top 5 architectural decisions still open, and propose the smallest safe phase-1 scaffold."
```

## Safe non-interactive run
```bash
codex exec "Using the repo docs as source of truth, create 02_PRODUCT/IMPLEMENTATION_PLAN_v1.md with phases, milestones, risks, and explicit exit criteria for phase 1. Then update status_bundle.txt."
```

## Windows recommendation
If you use Codex natively on Windows, prefer the native Windows sandbox in elevated mode when available. See `.codex/config.toml`.

## When code exists
After the first real scaffold is committed:
- add actual build/test commands to `AGENTS.md`
- add stack-specific skills under `.agents/skills/`
- add module-specific `AGENTS.md` or `AGENTS.override.md` files in deeper folders where needed
