# Design Decisions

This document captures the durable design decisions for the catalog consolidation take-home. It is intentionally compact so future AI sessions and interview review can load the context quickly.

## Product Matching

- A duplicate catalog product is identified by normalized `Name + Brand`.
- `Category` is descriptive metadata, not part of product identity. The supplied input includes `Camera Canon EOS R6` with both `Photography` and `Photo`, which makes category too noisy to split identity.
- Normalization trims, collapses repeated whitespace, and compares case-insensitively.
- Missing or `null` brand normalizes to an empty identity component. A brandless entry does not match a branded product by name alone.
- Normalized identity is computed in TypeScript for this exercise. Persisted normalized columns or expression indexes are a future performance improvement.

## Product Persistence

- Matched catalog products are not updated with seller-provided metadata. Seller import is consolidation, not catalog curation.
- New catalog products store cleaned source values: trimmed and whitespace-collapsed, without case normalization, translation, or synonym rewriting.

## Seller Links

- The seller product reference from the input is stored as text. The supplied schema uses `SellerProductId INTEGER`, but the input uses UUID strings, so preserving traceability requires adapting that column.
- Imports are idempotent. Re-running the same input must not create additional products or seller product links.
- `SellerName + seller product reference` is the seller entry idempotency key.
- Duplicate seller references inside the same input file are rejected and reported rather than silently chosen.

## Validation And Reporting

- Malformed or unreadable input files fail the run.
- Invalid entries inside a parseable file are rejected and reported with identifying context and a reason.
- Entries with multiple matching catalog products are rejected as ambiguous; the importer does not choose a canonical product arbitrarily.
- The import command prints structured JSON with `productsInserted`, `productsMatched`, `sellerLinksCreated`, `sellerLinksSkipped`, and `entriesRejected`.

## Transactions And Schema

- Valid entries are applied inside a single database transaction. Unexpected database write failures roll back the write phase.
- Schema changes live in explicit SQL migration files and are applied before import.
- Initial schema work should minimally adapt seller product references to text and add uniqueness protection for seller links.

## Layering And Boundaries

- Domain/application types live in `src/domain` and use application-facing naming and semantics.
- Database schema types live in `src/db` and reflect SQLite table/column shapes.
- Translation between database rows and domain models happens only in DB adapter mapper functions.
- Domain and application modules must not import database row types directly.
- Runtime errors are owned by the layer that raises them. Use specific error classes for domain, input, database, CLI, and application invariants instead of generic `Error`, so failures remain identifiable at adapter boundaries.

## Type Placement

- Durable domain contracts used across modules live in `src/domain/model.ts`.
- Database row and parameter contracts live in `src/db/schema.ts` and use database-facing primitive shapes.
- Layer output DTOs may live in that layer's `model.ts` when more than one module in the layer shares them.
- Operation-local helper types live beside the behavior that owns them.
- Export helper or intermediate types only when callers need them as part of a public seam.

## Architecture Organization

- Design public seams around behavior-level questions, not helper choreography. Prefer one deep module interface over several exported helper functions that callers must combine correctly.
- Apply the deletion test before adding a module or export. If deleting it only moves complexity to callers, the module is probably shallow.
- Keep operation-local helper functions and helper types private unless a caller needs them as part of a public seam.
- Adapters own translation only. Database schema modules use database-facing shapes; mapper modules are the only modules that know both database and domain vocabulary.
- Temporary lower-level seams used for TDD convenience must be treated as internal plumbing once the higher public seam exists.

## Interface And Scope

- The required behavior is exposed as a TypeScript CLI import command.
- The CLI is a thin adapter over an import use case; domain logic and database access remain testable outside command parsing.
- Prefer synchronous filesystem and database operations in the import path. The command processes one import at a time, and synchronous flow keeps orchestration aligned with `better-sqlite3`. Use async APIs only for genuinely asynchronous boundaries, streaming, parallel work, or libraries that require them.
- `import` writes by default. Dry-run, validate-only, inspect, rollback, and explain-match are deferred to avoid scope creep.
- The implementation stack is Node.js, TypeScript, Vitest, `tsx`, `better-sqlite3`, and hand-written validation. Zod or similar validation libraries can be added later if validation grows.

## Testing

- Use TDD.
- Exported source functions are tested directly by default. Exceptions are allowed for internal module plumbing only when the higher public seam is named and covered by tests.
- Test pure normalization and validation functions for happy paths and edge cases.
- Test the import use case with a temporary SQLite database and fixture JSON.
- Keep CLI tests thin: argument parsing, exit code, and output shape.
- Avoid testing private repository methods or SQL internals unless needed for a focused regression.

## Confidentiality

- Do not commit the supplied assessment PDFs, original SQLite database, or original import file.
- Use synthetic fixtures in the repository and accept external `--db` and `--input` paths for local assessment assets.
