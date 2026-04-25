---
name: electron-monorepo
description: Use this when working on the desktop shell, npm workspace wiring, Electron main/preload code, or React renderer scaffolding.
---

# Purpose
Keep desktop work pragmatic, Windows-friendly, and phase-1 sized.

# Rules
- Prefer simple Electron + React + TypeScript patterns.
- Keep Node-only code in the Electron main/preload layer.
- Keep renderer components dumb and easy to replace later.
- Avoid introducing state-management libraries until the task model proves they are necessary.

# Checklist
1. Verify package.json scripts are still coherent.
2. Keep preload APIs small and typed.
3. Do not expose raw Node primitives directly to renderer unless explicitly needed.
4. Update status if the desktop shell maturity changes.
