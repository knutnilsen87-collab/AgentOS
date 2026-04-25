# Local dev playbook

## Standard development loop
1. Run setup if dependencies are missing.
2. Run the desktop dev script.
3. Make one scoped change.
4. Re-run typecheck.
5. Update status bundle if the repo maturity changed.

## Windows-first commands
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-dev.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1
powershell -ExecutionPolicy Bypass -File .\scriptsalidate.ps1
```
