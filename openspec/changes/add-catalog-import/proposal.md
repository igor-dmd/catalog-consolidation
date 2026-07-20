## Why

The project needs the required catalog consolidation workflow: importing seller product entries from JSON into an existing SQLite catalog database without creating duplicate catalog products. This change turns the documented decisions in `docs/decisions.md` into an implementable OpenSpec plan for the TypeScript CLI.

## What Changes

- Add a TypeScript CLI operation exposed as `npm run import -- --db ./path/to/catalog.db --input ./path/to/products.json`.
- Parse and validate seller product entry JSON input, rejecting malformed files and invalid entries with structured reasons.
- Normalize product identity by cleaned `Name + Brand` so imports can match existing catalog products or insert new catalog products.
- Apply explicit SQLite migrations before import, including support for text seller product references and uniqueness protection for seller links.
- Import valid entries in a transaction, preserving idempotency across repeated runs.
- Print a structured JSON result with product, seller link, and rejection counts.
- Non-goals: dry-run, validate-only, inspect, rollback, explain-match, fuzzy matching, synonym translation, and seller-driven updates to existing catalog product metadata.

## Capabilities

### New Capabilities

- `catalog-import`: Imports seller product entries into the catalog database with validation, matching, persistence, idempotency, and structured reporting.

### Modified Capabilities

- None.

## Impact

- Affects Node.js project scaffold, TypeScript source, package scripts, tests, README usage notes, and SQLite migration files.
- Adds runtime and dev dependencies for the documented stack: TypeScript, Vitest, `tsx`, and `better-sqlite3`.
- Uses only synthetic fixtures in the repository; supplied assessment PDFs, original SQLite database, and original import file remain external.
