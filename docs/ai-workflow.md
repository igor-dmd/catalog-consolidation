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

Implementation should still proceed incrementally. Work through the OpenSpec task list one relevant task slice at a time, write or update tests for that slice, verify it, and only then mark the task complete. After completing a relevant task slice, stop for developer review before moving to the next unchecked task.

Split future OpenSpec changes only when the resulting pieces are independently meaningful capabilities or requirement changes that can be reviewed, implemented, and validated on their own.

## OpenSpec Execution Rules

OpenSpec artifacts are implementation contracts, not scratch notes. If implementation reveals a behavior change, update the relevant artifact before or alongside code: `proposal.md` for scope, `design.md` for approach, `spec.md` for requirements, and `tasks.md` for work tracking.

Use explicit non-interactive OpenSpec commands for agent-run checks so results are repeatable and do not depend on prompt handling. Interactive OpenSpec usage is fine for human-led exploration.

Task checkboxes should only be marked complete after their verification command passes. If a command cannot be run, leave the task unchecked or document the reason before marking it.

## Confidentiality

The public repository should not include the supplied assessment PDFs, original SQLite database, or original import file. Tests and examples should use synthetic fixtures that mirror the necessary schema and edge cases.
