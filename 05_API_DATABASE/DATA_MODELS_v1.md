# Data Models v1

## Core entities

### ProjectProfile
- id
- name
- root_path
- stack
- current_phase
- source_of_truth_files
- build_commands
- test_commands
- policy_profile
- skill_inventory

### Task
- id
- title
- description
- goal
- status
- risk_level
- agent_roles_used
- files_touched
- commands_run
- result_summary
- next_action

### RunLog
- id
- task_id
- timestamp
- event_type
- event_payload
- approval_state

### SkillRecord
- name
- description
- path
- scope
- enabled
- last_used

### PolicyRule
- id
- scope
- rule_type
- condition
- action
- escalation_behavior

## Modeling note
These are planning-stage models only.
Freeze actual schema after the first implementation stack is chosen.
