# First 25 Codex tasks

Use these in order unless a later task is blocked by something earlier.

1. Audit root package scripts and ensure the monorepo is internally consistent.
2. Verify all package names and local dependencies line up.
3. Tighten TypeScript configs so the workspace typechecks cleanly.
4. Review the Electron main process scaffold for correctness.
5. Review the preload bridge and narrow its surface if needed.
6. Review the Vite renderer scaffold and remove unnecessary complexity.
7. Make the desktop shell display environment, approval mode, and runtime readiness.
8. Implement a simple project-open flow in UI state only.
9. Connect the project scanner package to a local folder selection flow.
10. Render the project summary in the desktop dashboard.
11. Add a minimal task creation form.
12. Connect task input to the task-engine plan builder.
13. Show generated plan steps in a reviewable card layout.
14. Save task output to `.agentos/tasks/` through task-store.
15. Add a recent tasks list reading from local task-store.
16. Surface approval mode from policy-engine in the task panel.
17. Add a placeholder execution timeline section.
18. Add a placeholder diff/review section.
19. Add command log storage primitives even if command execution is stubbed.
20. Improve status bundle updating for actual repo state.
21. Add lightweight smoke tests for core packages.
22. Add linting and formatting workflow once the core slice works.
23. Add a settings panel for local data directory and approval mode.
24. Write an explicit end-to-end manual QA checklist.
25. Update handoff docs and define phase-2 entry criteria.
