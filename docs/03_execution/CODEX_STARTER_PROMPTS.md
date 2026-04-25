# Codex starter prompts

## Prompt 1 — repo onboarding
Read status_bundle.txt, README.md, AGENTS.md, docs/03_execution/PHASE_1_BUILD_ORDER.md, and docs/03_execution/FIRST_25_CODEX_TASKS.md. Summarize the exact current maturity of the repo, then propose the smallest safe path to first local verification on Windows.

## Prompt 2 — make typecheck pass
Audit the npm workspace packages and TypeScript configs. Fix only the smallest set of issues required to make the workspace typecheck cleanly after install. Do not expand scope beyond compileability.

## Prompt 3 — first vertical slice
Implement the smallest end-to-end vertical slice: open a local project, scan it read-only, create a task plan, save the task locally, and render the result in the desktop UI. Keep command execution stubbed if needed.

## Prompt 4 — review and status sync
Review the current repo state against docs and code. Update status_bundle.txt and handoff_notes.md so they match reality exactly.
