# Interaction Log

This document records the planning and implementation workflow for later discussion with the assessment interviewers.

## 2026-07-19

- Extracted the take-home assessment and guideline PDFs.
- Confirmed the supplied assets are `catalog.db` and `ProductEntry.json`.
- Inspected the database shape: `Product` is pre-populated and `SellerProduct` starts empty.
- Inspected the import file shape: seller product entries include `Id`, `SellerName`, `Name`, `Brand`, and `Category`.
- Decided that duplicate product identity is normalized `Name + Brand`; `Category` is metadata and should not split product identity.
- Documented the product identity decision in ADR 0001.
- Discussed the mismatch between `SellerProduct.SellerProductId INTEGER` and UUID string IDs in `ProductEntry.json`.
- Decided to store the seller product reference as opaque text, while documenting the trade-off against preserving the supplied schema unchanged or adding broader metadata storage.
- Documented the seller product reference decision in ADR 0002.
- Decided imports must be idempotent: rerunning the same input must not create additional catalog products or seller product links.
- Documented idempotent import behavior in ADR 0003.
- Decided malformed files should fail the run, while invalid individual entries in a parseable file should be rejected and reported with reasons.
- Documented rejected-entry reporting in ADR 0004.
- Decided valid import entries should be applied inside a single transaction, rolling back all database writes on unexpected write failures.
- Documented the transaction boundary in ADR 0005.
- Decided to ship the required behavior as a TypeScript CLI, with the CLI kept as a thin adapter over an import use case.
- Explicitly deferred adjacent operations such as validate-only, dry-run, inspect, rollback, and explain-match to avoid scope creep.
- Documented the CLI/use-case boundary and scope guard in ADR 0006.
- Decided schema changes should live in explicit SQL migration files applied by the importer before consolidation.
- Documented the migration strategy in ADR 0007.
- Agreed on TDD testing seams: pure domain functions, input parsing/validation, import use case with temporary SQLite, and thin CLI smoke tests.
- Added pure happy-path unit tests to the planned testing approach, not only edge-case tests.
- Documented the testing boundary in ADR 0008.
- Decided to use a minimal TypeScript Node stack: Vitest, tsx, better-sqlite3, and hand-written validation instead of Zod for now.
- Documented the implementation stack in ADR 0009.
- Decided not to commit the supplied PDFs, original database, or original import file to the public repository because the guideline document marks the material confidential.
- Decided to use synthetic fixtures in the repo and support external file paths for local assessment assets.
- Documented repository hygiene in ADR 0010.
- Decided the import result should be structured JSON including products inserted, products matched, seller links created, seller links skipped, and rejected entries.
- Discussed dry-run-by-default and decided against it for the take-home because `import` should save by default; dry-run remains a possible future extension.
- Documented write-by-default import behavior in ADR 0011.
- Decided duplicate `SellerName + seller product reference` entries inside the same input file should be rejected and reported rather than silently chosen.
- Documented duplicate seller-reference handling in ADR 0012.
- Decided entries with multiple existing catalog matches should be rejected as ambiguous instead of linked arbitrarily.
- Documented ambiguous catalog match handling in ADR 0013.
- Discussed whether normalized product identity should be persisted in the database or computed in application code.
- Decided to normalize in TypeScript for the take-home and document database-level normalized indexes as a future performance improvement.
- Documented application-level identity normalization in ADR 0014.
- Decided new catalog products should store cleaned source values, while identity normalization remains an internal matching concern.
- Documented stored value cleanup in ADR 0015.
- Discussed null-brand matching trade-offs: empty identity component, name-only matching, or rejecting missing brands.
- Decided missing brand becomes an empty identity component and does not widen matching to branded products.
- Documented null-brand identity behavior in ADR 0016.
- Decided matched catalog products should not be updated with seller-provided metadata during import.
- Documented the no-update rule for matched products in ADR 0017.
