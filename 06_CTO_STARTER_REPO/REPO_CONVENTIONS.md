# Repo Conventions

## Core rules
- `status_bundle.txt` is the primary operational status file.
- `README_MASTER.md` is the primary human overview.
- `AGENTS.md` governs default Codex behavior in the repo.
- `.codex/config.toml` governs project-scoped Codex config.
- `.codex/agents/` defines project-scoped custom agents.
- `.agents/skills/` holds repo-local reusable skills.

## Branching
Use small, reviewable branches once implementation begins.

## Commit discipline
- prefer atomic commits
- keep docs/status aligned with meaningful repo milestones
- do not hide architectural changes inside large mixed commits

## Review discipline
Every meaningful change should preserve:
- what changed
- why it changed
- what remains unverified
- what the next action is
