# Stack decisions for phase 1

## Selected default stack
- **Workspace:** npm workspaces
- **Language:** TypeScript
- **Desktop shell:** Electron + React + Vite
- **Persistence:** filesystem-backed local state under `.agentos/`
- **Build philosophy:** minimal compileable slices before feature breadth

## Why this is the fastest path
This stack keeps the first version close to the user's real environment: Windows, local repos, shell execution, and visible review flows.

## Deliberate non-decisions for later
- database engine
- cloud runtime
- multi-user auth
- sync across machines
- enterprise policy distribution
