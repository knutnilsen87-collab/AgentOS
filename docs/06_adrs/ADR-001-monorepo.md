# ADR-001: Use a monorepo for phase 1

## Status
Accepted

## Decision
Use a single npm-workspace monorepo to keep desktop app code, shared domain packages, and repo documentation aligned.

## Why
- faster onboarding for a solo builder
- fewer moving parts in phase 1
- easier Codex context and patching
- clearer package boundaries than one giant app folder

## Consequences
- root scripts become important
- package boundaries must stay intentional
