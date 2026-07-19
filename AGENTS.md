# Agent Instructions

## Mandatory Review Gates

The agent MUST treat planning approval and code approval as separate gates.

### Gate 1: Pre-Edit Plan Review

Before making any relevant source, test, spec, task-list, or documentation change, the agent MUST:

1. Inspect the repository.
2. Summarize the intended implementation.
3. List the files expected to change.
4. Stop and wait for explicit user approval.

The agent MUST NOT edit files until the user explicitly approves the plan.

### Gate 2: Post-Edit Code Review

After making any relevant implementation change, the agent MUST stop and prompt the user to review the generated code before continuing to the next relevant change.

The agent MUST NOT continue implementing additional relevant tasks, update unrelated task checkboxes, proceed to the next task group, or make follow-up code changes until the user explicitly approves the generated code.

A passing test run does NOT replace user code review.

### Relevant Changes

Relevant changes include:

- Source code changes
- Test changes
- Database schema or migration changes
- CLI behavior changes
- Public type/interface changes
- OpenSpec task/spec/design/proposal updates
- Documentation that describes behavior or usage

### Allowed Without Review

The agent may run read-only inspection commands and non-mutating tests/checks without review approval.

### Approval Language

Only explicit approval counts, such as:

- "approved"
- "code approved"
- "continue"
- "proceed with the next task"
- "make the next changes"

Plan approval only authorizes the next edit batch. It does not authorize skipping post-edit code review.
