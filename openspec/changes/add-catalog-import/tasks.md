## 1. Project Scaffold and Tooling

- [x] 1.1 Add Node.js/TypeScript project files, `npm run import`, `npm test`, and any needed scripts for Vitest and `tsx`.
- [x] 1.2 Add documented dependencies: TypeScript, Vitest, `tsx`, `better-sqlite3`, and matching TypeScript types where needed.
- [x] 1.3 Create the initial source and test directory structure for CLI, domain, application, database, migrations, and synthetic fixtures.
- [x] 1.4 Verify scaffold with `npm test -- --run`.

## 2. Data Model

- [x] 2.1 Define core TypeScript types for seller product entries, catalog products, seller product links, and opaque seller product references.
- [x] 2.2 Keep database row types separate from domain/application types and define adapter translation boundaries.
- [x] 2.3 Add compile-time or focused unit coverage that exercises the intended model shapes without requiring SQLite.
- [x] 2.4 Verify data model setup with `npm test -- --run src/domain`.

## 3. Domain Normalization

- [x] 3.1 Add tests for cleaning values by trimming and collapsing whitespace while preserving source casing.
- [x] 3.2 Add tests for normalized product identity comparison by case-insensitive cleaned `Name + Brand`.
- [x] 3.3 Implement cleaned value and normalized identity functions, including the product identity value shape and missing or `null` brand as an empty identity component.
- [x] 3.4 Verify domain normalization with `npm test -- --run src/domain`.

## 4. Input Parsing and Validation

- [x] 4.1 Add unreadable or malformed JSON input behavior with focused tests, minimal implementation, and `npm test -- --run src/input`.
- [ ] 4.2 Add parseable invalid-entry rejection behavior with focused tests, minimal implementation, identifying context, reasons, and `npm test -- --run src/input`.
- [ ] 4.3 Add duplicate `SellerName + seller product reference` behavior with focused tests, minimal implementation, seller entry idempotency key shape, and `npm test -- --run src/input`.
- [ ] 4.4 Verify input behavior with `npm test -- --run src/input`.

## 5. SQLite Migrations

- [ ] 5.1 Add synthetic SQLite schema fixture behavior with focused tests, representative assessment catalog tables, and `npm test -- --run src/db`.
- [ ] 5.2 Add opaque text seller product reference migration behavior with focused tests, SQL migration implementation, and `npm test -- --run src/db`.
- [ ] 5.3 Add seller link uniqueness migration behavior with focused tests, SQL migration implementation, and `npm test -- --run src/db`.
- [ ] 5.4 Add migration idempotency behavior with focused tests, migration runner implementation, and `npm test -- --run src/db`.
- [ ] 5.5 Verify migrations with `npm test -- --run src/db`.

## 6. Import Use Case

- [ ] 6.1 Add existing catalog product matching behavior with integration tests, minimal import implementation, normalized name and brand matching, and `npm test -- --run src/import`.
- [ ] 6.2 Add new catalog product insertion behavior with integration tests, minimal import implementation, cleaned source values, and `npm test -- --run src/import`.
- [ ] 6.3 Add brandless identity behavior with integration tests, minimal import implementation, and `npm test -- --run src/import`.
- [ ] 6.4 Add ambiguous catalog match rejection behavior with integration tests, minimal import implementation, rejected entry output, and `npm test -- --run src/import`.
- [ ] 6.5 Add seller link creation and repeated-run idempotency behavior with integration tests, minimal import implementation, result counts, and `npm test -- --run src/import`.
- [ ] 6.6 Add valid-entry transaction behavior with integration tests, minimal import implementation, rollback on unexpected write failure, and `npm test -- --run src/import`.
- [ ] 6.7 Verify import behavior with `npm test -- --run src/import`.

## 7. CLI Adapter

- [ ] 7.1 Add required CLI argument behavior with smoke tests, minimal argument parsing for `--db` and `--input`, non-zero failures, and `npm test -- --run src/cli`.
- [ ] 7.2 Add successful CLI import output behavior with smoke tests, import use case wiring, stdout JSON fields, and `npm test -- --run src/cli`.
- [ ] 7.3 Verify CLI behavior with `npm test -- --run src/cli`.

## 8. Documentation and Final Verification

- [ ] 8.1 Update README usage notes with the import command, expected output shape, and confidentiality guidance for external assessment assets.
- [ ] 8.2 Run the full test suite with `npm test -- --run`.
- [ ] 8.3 Validate the OpenSpec change with `openspec validate add-catalog-import --type change --strict --no-interactive`.
- [ ] 8.4 Confirm readiness with `openspec status --change add-catalog-import`.
