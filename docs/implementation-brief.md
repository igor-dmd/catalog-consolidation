# Implementation Brief

This brief is the execution entry point for OpenSpec and TDD work. It intentionally avoids restating the full decision record.

## Objective

Build the required catalog import capability: a TypeScript CLI that reads seller product entries from JSON and consolidates them into an existing SQLite catalog database.

## Deliverable

Implement one CLI operation:

```bash
npm run import -- --db ./path/to/catalog.db --input ./path/to/products.json
```

The command writes by default and prints a structured JSON result.

## Suggested OpenSpec Change

Use one cohesive change:

```text
add-catalog-import
```

Suggested TDD task slices:

1. Project scaffold and tooling.
2. Domain normalization and cleaned value functions.
3. Input parsing and validation.
4. SQLite migration runner.
5. Import use case with transaction and idempotency.
6. CLI adapter.
7. README and final usage notes.

## TDD Seams

- Pure unit tests for normalization and validation.
- Integration tests for the import use case with temporary SQLite.
- Thin CLI smoke tests for argument parsing, exit code, and output shape.

## Source Documents

- `docs/decisions.md`: behavior, architecture, scope, and trade-offs.
- `CONTEXT.md`: domain language.
- `docs/ai-workflow.md`: AI-assisted workflow narrative.
