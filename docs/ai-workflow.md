# AI Workflow

This project uses AI as a planning and implementation assistant, with decisions owned and validated by the developer.

## How AI Was Used

- Extracted and summarized the take-home assessment and interview guideline documents.
- Inspected the supplied SQLite database and JSON import file to ground design decisions in actual data.
- Ran a grilling process before coding to resolve intentional ambiguities.
- Captured durable decisions in `docs/decisions.md` and domain language in `CONTEXT.md`.
- Planned a TDD workflow with explicit testing boundaries before implementation.
- Challenged scope-expanding ideas such as dry-run-by-default and deferred them when they were not required by the exercise.

## Validation Approach

AI suggestions are treated as proposals, not accepted facts. Decisions were checked against the supplied schema, import data, and assessment text before being documented.

## OpenSpec Change Boundaries

OpenSpec changes should describe one cohesive product or behavior change, not one small coding task. A change may contain several implementation tasks when those tasks only make sense together as one user-facing capability.

For example, `add-catalog-import` remains one change because project setup, normalization, validation, migrations, the import use case, the CLI adapter, and README updates all support the same required catalog import operation.

Implementation should still proceed incrementally using vertical TDD. For each behavior slice, agree the public seam, write one focused failing test or small coherent test slice, implement only enough code to pass it, run the relevant narrow verification, and only then mark the related task complete. After a numbered task section is complete, stop for developer review before moving to the next numbered section.

Within an approved numbered section, the agent may continue through multiple verified vertical behavior slices without stopping after every checked subtask. The agent must still stop mid-section for blockers, scope changes, design issues, stale or horizontal task shapes, or required artifact updates not covered by the approved plan.

Do not batch tests for several future behaviors and defer implementation to a later task. If an OpenSpec task list separates tests and implementation horizontally, treat the list as planning guidance and execute it as vertical behavior slices while keeping checkboxes aligned with verified passing behavior.

When the project workflow changes, active OpenSpec task lists must be checked and all affected unchecked future tasks must be reshaped before implementation continues. Before starting an OpenSpec task, verify that it describes a vertical behavior slice. If it does not, update the task list first so task completion remains tied to passing behavior rather than partial test or implementation inventory.

Split future OpenSpec changes only when the resulting pieces are independently meaningful capabilities or requirement changes that can be reviewed, implemented, and validated on their own.

## OpenSpec Execution Rules

OpenSpec artifacts are implementation contracts, not scratch notes. If implementation reveals a behavior change, update the relevant artifact before or alongside code: `proposal.md` for scope, `design.md` for approach, `spec.md` for requirements, and `tasks.md` for work tracking.

Use explicit non-interactive OpenSpec commands for agent-run checks so results are repeatable and do not depend on prompt handling. Interactive OpenSpec usage is fine for human-led exploration.

Task checkboxes should only be marked complete after their verification command passes. If a command cannot be run, leave the task unchecked or document the reason before marking it.

## Confidentiality

The public repository should not include the supplied assessment PDFs, original SQLite database, or original import file. Tests and examples should use synthetic fixtures that mirror the necessary schema and edge cases.
