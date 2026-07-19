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

## Confidentiality

The public repository should not include the supplied assessment PDFs, original SQLite database, or original import file. Tests and examples should use synthetic fixtures that mirror the necessary schema and edge cases.
