# Agent Instructions

## Mandatory Review Gates

The agent MUST treat planning approval and code approval as separate gates.

## Mandatory Vertical TDD

Implementation work MUST proceed in vertical TDD slices unless the user explicitly approves an exception.

For each behavior slice, the agent MUST:

1. Identify the public seam under test.
2. Add or update one focused failing test or small coherent test slice.
3. Implement only the code needed to make that slice pass.
4. Run the relevant narrow verification command.
5. Mark the related task complete only after verification passes.
6. Continue to the next behavior slice in the same approved task section.

The agent MUST NOT write a batch of tests for multiple future behaviors and defer implementation to a later task. OpenSpec task ordering does not override this rule; if an OpenSpec task list separates tests and implementation horizontally, the agent MUST work through it as vertical behavior slices and keep task checkboxes aligned with verified passing behavior.

When a workflow rule changes, the agent MUST inspect active OpenSpec task lists and propose updates to all affected unchecked future tasks before continuing implementation. Before starting any OpenSpec task, the agent MUST verify the task is shaped as a vertical behavior slice. If the task is horizontal, stale, or inconsistent with verified behavior, the agent MUST propose a task-list update before implementation.

## Layer-Owned Errors

When throwing errors from source code, the agent MUST use a specific error class owned by the relevant layer. The agent MUST NOT throw generic `Error` for domain, input, database, CLI, or application invariants unless the user explicitly approves an exception.

## Exported Function Tests

Exported source functions MUST have direct unit tests unless they are explicitly documented as internal module plumbing and covered through a higher public seam. When adding or exporting a function, the agent MUST either add or update direct tests in the same edit batch, or document why the higher seam is the intended test boundary.

## Test Retirement

Temporary or lower-level tests created to drive a TDD slice MUST be removed or folded into the higher public seam test once the higher seam exists and covers the behavior. The agent MUST NOT keep obsolete tests as extra safety when they only duplicate stronger public behavior coverage or lock in internal plumbing.

When removing an export, collapsing an abstraction, or replacing a temporary seam with a public seam, the agent MUST inspect affected tests in the same edit batch and remove or rewrite tests that are no longer relevant.

### Gate 1: Pre-Edit Plan Review

Before making any relevant source, test, spec, task-list, or documentation change, the agent MUST:

1. Inspect the repository.
2. Summarize the intended implementation.
3. List the files expected to change.
4. Stop and wait for explicit user approval.

The agent MUST NOT edit files until the user explicitly approves the plan.

### Gate 2: Post-Edit Code Review

After completing a numbered OpenSpec task section, such as all tasks under `6. Import Use Case`, the agent MUST stop and prompt the user to review the generated code before continuing to the next numbered section.

Within an approved numbered section, the agent MAY continue through multiple verified vertical behavior slices without stopping for review after each checked subtask. The agent MUST NOT proceed to the next numbered section, update unrelated task checkboxes, or make follow-up code changes outside the approved section until the user explicitly approves the generated code.

The agent MUST still stop mid-section if implementation reveals a blocker, scope change, design issue, stale or horizontal task shape, or any required artifact update that was not covered by the approved plan.

A passing test run does NOT replace user code review at the section boundary.

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

Plan approval authorizes the approved task section or explicitly described edit batch. It does not authorize proceeding into the next numbered section or skipping post-edit code review at the section boundary.
