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

- The seller product reference from the input is stored as opaque text. The supplied schema uses `SellerProductId INTEGER`, but the input uses UUID strings, so preserving traceability requires adapting that column.
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

## Interface And Scope

- The required behavior is exposed as a TypeScript CLI import command.
- The CLI is a thin adapter over an import use case; domain logic and database access remain testable outside command parsing.
- `import` writes by default. Dry-run, validate-only, inspect, rollback, and explain-match are deferred to avoid scope creep.
- The implementation stack is Node.js, TypeScript, Vitest, `tsx`, `better-sqlite3`, and hand-written validation. Zod or similar validation libraries can be added later if validation grows.

## Testing

- Use TDD.
- Test pure normalization and validation functions for happy paths and edge cases.
- Test the import use case with a temporary SQLite database and fixture JSON.
- Keep CLI tests thin: argument parsing, exit code, and output shape.
- Avoid testing private repository methods or SQL internals unless needed for a focused regression.

## Confidentiality

- Do not commit the supplied assessment PDFs, original SQLite database, or original import file.
- Use synthetic fixtures in the repository and accept external `--db` and `--input` paths for local assessment assets.

