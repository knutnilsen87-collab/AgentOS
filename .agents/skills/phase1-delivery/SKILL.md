---
name: phase1-delivery
description: Use this when executing or planning the smallest viable path from scaffold to a working phase-1 product slice.
---

# Goal
Move from scaffold to a minimal but real product slice without overbuilding.

# Default order
1. dependency install
2. typecheck/build verification
3. desktop shell runs
4. project scanner wired
5. task planner wired
6. local task persistence wired
7. approval states visible in UI
8. first review output

# Guardrails
- Favor one thin vertical slice over many disconnected features.
- Prefer filesystem persistence before database complexity.
- Prefer explicit review artifacts before autonomy.
