## Context

This repository is for the VTEX catalog consolidation take-home. The implementation must provide a TypeScript CLI that imports seller product entries from JSON into an existing SQLite catalog database, using the behavior and trade-offs already captured in `docs/decisions.md`.

The expected stack is Node.js, TypeScript, Vitest, `tsx`, `better-sqlite3`, and hand-written validation. Original assessment assets must remain outside the repository; tests and examples use synthetic fixtures.

## Goals / Non-Goals

**Goals:**

- Expose one import command: `npm run import -- --db ./path/to/catalog.db --input ./path/to/products.json`.
- Keep the CLI thin over a testable import use case.
- Normalize catalog product identity by cleaned `Name + Brand` for matching.
- Validate input shape and reject unusable seller product entries with structured reasons.
- Apply explicit SQLite migrations before import.
- Preserve idempotency for seller product links by `SellerName + seller product reference`.
- Commit valid entries in a single transaction and print structured JSON output.

**Non-Goals:**

- Dry-run, validate-only, inspect, rollback, explain-match, fuzzy matching, synonym translation, and catalog curation from seller metadata.
- Persisted normalized columns or expression indexes for product identity.
- Support for the original assessment files as committed fixtures.

## Decisions

1. Use a layered TypeScript implementation.

   The CLI adapter handles argument parsing, process exit codes, filesystem handoff, and JSON output. The import use case handles orchestration. Domain modules handle normalization and validation. The SQLite adapter handles schema and persistence. This keeps test seams aligned with `docs/implementation-brief.md`.

   Alternative considered: implement the command as one script. That is faster initially, but it couples parsing, matching, validation, and database writes and makes TDD slices harder to maintain.

2. Compute normalized identity in TypeScript.

   Product matching will trim values, collapse repeated whitespace, and compare `Name + Brand` case-insensitively. Missing or `null` brand normalizes to an empty component, so brandless entries only match brandless catalog products with the same normalized name.

   Alternative considered: add persisted normalized columns or SQLite expression indexes immediately. That may help performance later, but it expands schema changes beyond the exercise's needs.

3. Treat seller product references as opaque text.

   The migration layer adapts seller product link storage so imported seller product references can be string values, including UUIDs. A uniqueness constraint on seller name plus seller product reference enforces idempotency at the database boundary.

   Alternative considered: coerce references to integers to match the supplied schema. That loses traceability for UUID inputs and conflicts with the recorded decisions.

4. Validate parseable files entry-by-entry, but fail unreadable or malformed files.

   If the input file cannot be read or parsed, the command fails before import. If the file is parseable, invalid entries are reported as rejected entries and valid entries continue through the transaction.

   Alternative considered: fail the entire import for any invalid entry. The brief requires rejected-entry reporting, so partial rejection within a parseable file gives more useful feedback while still avoiding invalid writes.

5. Use one transaction for valid write operations.

   Migrations run before import. Valid entries are consolidated inside a single database transaction so unexpected write failures roll back the import write phase. Ambiguous catalog matches and duplicate seller references in the same input are rejected before writes.

   Alternative considered: write each entry independently. That can preserve partial progress on database failures, but weakens predictability for a command that reports one structured import result.

## Data Model

The import implementation will introduce model shapes when their behavior slice needs them, so names are grounded in real call sites instead of speculative abstractions.

- `SellerProductEntry`: input-facing record read from JSON. It carries seller ownership data, a seller product reference, and descriptive product values from the seller.
- `CatalogProduct`: canonical product row in the marketplace catalog. It is independent of any one seller and is inserted only when no unambiguous normalized match exists.
- `SellerProductLink`: persisted association between a seller product entry and a catalog product. It preserves seller name and seller product reference for traceability and idempotency.

Derived values and output DTOs are added with the behavior that produces them:

- Product identity belongs with normalization behavior and is built from normalized `Name + Brand`.
- Seller entry idempotency keys belong with duplicate detection and link idempotency behavior.
- Rejected entry records belong with validation and matching rejection behavior.
- Import results belong with the import use case and CLI output behavior.

Model boundaries:

- `SellerProductEntry` is not a canonical product and is not persisted directly as one.
- `CatalogProduct` is not updated from seller metadata when a match is found.
- `SellerProductLink` is the only model that records seller ownership of a catalog product.
- Database row shapes can differ from domain types, but adapters must translate without leaking SQL details into domain logic.

## Risks / Trade-offs

- Existing database schema may differ from the expected assessment schema -> migrations must be explicit and tests must create representative synthetic schemas.
- Name and brand normalization may miss real-world duplicates -> this is an accepted scope trade-off from `docs/decisions.md`; fuzzy matching is deferred.
- Case-insensitive matching in TypeScript requires scanning candidate catalog products -> acceptable for the take-home scale; persisted normalized identity can be added later.
- Duplicate catalog products already in the database can make a seller entry ambiguous -> reject and report those entries rather than choosing arbitrarily.
- `better-sqlite3` is a native dependency -> document install expectations and keep database tests focused on integration coverage.

## Migration Plan

1. Add SQL migration files that minimally adapt seller product reference storage to text and add uniqueness protection for seller links.
2. Implement a migration runner that records/applies migrations before import.
3. Exercise migrations through integration tests using temporary SQLite databases.
4. Rollback is manual for this exercise: restore the original external database backup if needed. The CLI does not implement rollback mode.

## Open Questions

- None for the planned scope. Field names and table names will be verified against the synthetic schema and the supplied assessment database during implementation without committing assessment assets.
