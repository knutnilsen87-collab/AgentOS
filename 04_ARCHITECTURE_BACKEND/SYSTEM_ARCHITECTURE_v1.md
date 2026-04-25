# System Architecture v1

## 1. Architecture goal
Design a system that can combine:
- local-first control
- agentic execution
- persistent context
- safe automation
- extensibility for future cloud and multi-agent operation

## 2. Major layers
### Client / Surface layer
- desktop app
- CLI/terminal companion
- later web control plane
- later IDE integration

### Orchestrator layer
- task intake
- complexity classification
- plan generation
- agent routing
- approval checkpoints
- result packaging

### Agent runtime layer
- model invocation
- context assembly
- tool selection
- execution loop
- run logging

### Execution layer
- file read/write
- shell commands
- sandbox boundaries
- diff generation
- rollback hooks
- test/build execution when repo supports it

### Memory layer
- project profile
- instructions
- skills
- previous runs
- reusable patterns
- project graph later

### Policy / safety layer
- approval policy
- sandbox mode
- network boundaries
- protected paths
- secrets handling
- risk escalations

### Observability layer
- task logs
- artifacts
- run history
- change summaries
- replay/comparison later

## 3. Phase-1 implementation recommendation
Start with a narrow but useful slice:
1. repository bootstrap + Codex guidance
2. project scanner
3. task planner
4. safe execution abstraction
5. status bundle + review output
6. first desktop shell
7. testable local workflows

## 4. Key architecture decisions still open
- desktop stack
- runtime language(s)
- how local sandboxing will be implemented in product code
- how multi-agent orchestration is represented internally
- persistence design for memory and task history

## 5. Architecture rule
Do not overbuild the first executable scaffold.
A narrow, auditable phase-1 system is more valuable than a broad, fragile prototype.
