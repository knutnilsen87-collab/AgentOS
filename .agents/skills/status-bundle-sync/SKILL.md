---
name: status-bundle-sync
description: Use when a meaningful repo milestone has been reached and `status_bundle.txt` must be updated accurately.
---

When updating `status_bundle.txt`:
1. preserve machine-readable JSON validity
2. update `LAST_UPDATED`
3. update `CURRENT_PHASE` only if the phase genuinely changed
4. update `LAST_ACTION`
5. update `LAST_RESULT`
6. update `NEXT_ACTION`
7. do not overstate verification status
