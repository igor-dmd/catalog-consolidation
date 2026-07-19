# Implementation Brief

This brief is the handoff artifact for turning the design decisions into OpenSpec work items and TDD implementation slices.

## Objective

Build a TypeScript CLI that consolidates seller product entries from a JSON file into an existing SQLite catalog database.

The required behavior is: for each seller product entry, insert a new `Product` only when no matching catalog product exists; otherwise link the seller entry to the existing catalog product through `SellerProduct`.

## Inputs

- SQLite database path supplied at runtime.
- JSON import file path supplied at runtime.

The original assessment assets remain outside the public repository. Tests should use synthetic fixtures.

## Current Database Shape

```sql
CREATE TABLE Product (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Name TEXT NOT NULL,
  Brand TEXT,
  Category TEXT
);

CREATE TABLE SellerProduct (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  SellerName TEXT NOT NULL,
  ProductId INTEGER NOT NULL REFERENCES Product (Id),
  SellerProductId INTEGER NOT NULL
);
```

## Target Behavior

- Product identity is normalized `Name + Brand`.
- Category is descriptive metadata and must not split product identity.
- Normalization trims, collapses whitespace, and compares case-insensitively.
- Missing or `null` brand becomes an empty identity component.
- Matching products are not updated.
- New products store cleaned source values: trimmed and whitespace-collapsed, without case normalization or translation.
- Seller links preserve the seller product reference from the input.
- Imports are idempotent.
- Duplicate `SellerName + seller product reference` entries inside one file are rejected and reported.
- Entries with ambiguous catalog matches are rejected and reported.
- Malformed or unreadable files fail the run.
- Invalid entries inside a parseable file are rejected with reasons.
- Valid entries are applied in one transaction; unexpected DB write failures roll back the write phase.

## CLI Scope

Build only the required import operation.

Example:

```bash
npm run import -- --db ./path/to/catalog.db --input ./path/to/ProductEntry.json
```

The CLI should print structured JSON including:

- `productsInserted`
- `productsMatched`
- `sellerLinksCreated`
- `sellerLinksSkipped`
- `entriesRejected`

Dry-run, validate-only, inspect, rollback, and explain-match are deferred.

## Architecture Boundary

- CLI adapter: parse arguments, call the import use case, print JSON, map errors to exit codes.
- Import use case: parse input, validate entries, apply migrations, coordinate transaction, return import result.
- Domain logic: normalization, identity keys, duplicate decisions, rejection reasons.
- Database adapter: SQLite queries, writes, transaction, migration execution.

## Testing Seams

Use TDD. Confirmed seams:

- Pure unit tests for normalization happy paths and edge cases.
- Pure unit tests for input validation happy paths and rejection cases.
- Integration tests for the import use case with a temporary SQLite database and fixture JSON.
- Thin CLI smoke tests for argument parsing, exit code, and output shape.

Avoid testing private repository methods or SQL internals unless needed for a focused regression.

## Key Decisions

See ADRs in `docs/adr/`:

- ADR 0001: product identity uses name and brand.
- ADR 0002: seller product reference is stored as text.
- ADR 0003: imports are idempotent.
- ADR 0004: rejected entries are reported.
- ADR 0005: valid import entries are applied atomically.
- ADR 0006: CLI adapter over import use case.
- ADR 0007: explicit SQL migrations.
- ADR 0008: test at domain, use-case, and CLI boundaries.
- ADR 0009: minimal TypeScript Node stack.
- ADR 0010: do not commit confidential assessment assets.
- ADR 0011: import command writes by default.
- ADR 0012: reject duplicate seller references in input.
- ADR 0013: reject ambiguous catalog matches.
- ADR 0014: normalize product identity in application code.
- ADR 0015: store cleaned source values for new products.
- ADR 0016: missing brand is an empty identity component.
- ADR 0017: do not update matched catalog products.

