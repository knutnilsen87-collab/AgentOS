# PRD + Requirements v1

## 1. Product definition
AgentOS is a desktop-first agentic project operating system for understanding, planning, executing, verifying, reviewing, and improving work across code, documentation, design, repo workflows, and automation.

## 2. Core problem
Current technical work is fragmented.
Users lose time and trust because:
- context is split across tools
- AI sessions do not persist project understanding reliably
- execution is unsafe or opaque
- there is poor continuity between planning and implementation

## 3. Product goals
- enable real work delegation without losing human control
- keep project context persistent and reusable
- support safe execution in sandboxed environments
- create reviewable, replayable, auditable work output
- scale from solo builder use to later small-team use

## 4. Core operating model
Understand → Plan → Execute → Verify → Review → Learn

## 5. In scope for phase 1
- desktop-first shell
- local repo/project onboarding
- task planning
- sandbox-aware execution design
- diff/review workflow
- status and handoff model
- project memory model
- Codex-ready repo conventions

## 6. Out of scope for initial phase
- full enterprise admin layer
- mobile app
- full cloud multi-tenant runtime
- production-grade billing
- proprietary foundation model training

## 7. Key capabilities
### A. Project understanding
- parse repo structure
- identify likely entry points
- read design/docs/runbooks
- build a project profile

### B. Task execution
- read/write files
- run shell commands
- stage diffs for review
- connect execution to task history

### C. Orchestration
- route between planning, implementation, review, and safety roles
- split large tasks into smaller tasks
- support custom agents and reusable skills

### D. Memory
- project rules
- user preferences
- learned workflows
- prior runs
- domain packs

### E. Safety
- sandbox boundaries
- approval modes
- audit logs
- risk gates
- secrets isolation

## 8. Functional requirements
- the system shall support local project onboarding
- the system shall support task creation in natural language
- the system shall produce an explicit plan before high-risk execution
- the system shall preserve a visible task history
- the system shall support project-specific instructions
- the system shall support repo-scoped reusable skills
- the system shall support multiple agent roles
- the system shall support review before permanent file application

## 9. Non-functional requirements
- Windows-first in initial phase
- clear auditability
- transparent status updates
- human-readable + machine-readable state
- conservative default autonomy
- extensible architecture for later cloud execution

## 10. Success criteria
- a new contributor can understand the project quickly
- Codex can onboard from repo files without the original chat
- the repo can produce a concrete implementation plan with minimal ambiguity
- future implementation work can proceed in phased, reviewable increments
