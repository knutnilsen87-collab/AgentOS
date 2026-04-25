---
name: ui-mission-control
description: Use this when implementing or reviewing the AgentOS desktop UI so the shell stays mission-first, review-first, and consistent with the repo workflow.
---

# Goal
Build a stable, adaptive mission-control UI instead of a generic AI chat shell.

# Use this skill for
- desktop shell layout work
- mission/plan/review UI
- approval and risk visibility
- onboarding and project summary states
- adaptive guided vs advanced profile work

# Rules
1. Keep the 5-region application frame stable.
2. Prefer mission -> constraints -> plan -> review -> verification over chat-first designs.
3. Make approval mode and risk visible in the header and/or right rail.
4. Use the right rail for evidence, warnings, and approvals.
5. Do not move navigation around when making the UI adaptive.
6. Adapt density and visible guidance, not the whole structure.
7. Keep phase-1 UI implementation light and typed.
8. Do not introduce heavyweight state libraries just to satisfy shell layout.

# Read before implementing
- `docs/05_ui_ux/PHASE_1_UI_LAYOUT.md`
- `docs/05_ui_ux/UI_IMPLEMENTATION_SEQUENCE.md`
- `02_PRODUCT/PRD_REQUIREMENTS_v1.md`
- `07_POLICY_LEGAL_RISK/SAFETY_AND_APPROVAL_MODEL.md`
