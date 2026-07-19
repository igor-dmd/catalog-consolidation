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

- [ ] 3.1 Add tests for cleaning values by trimming and collapsing whitespace while preserving source casing.
- [ ] 3.2 Add tests for normalized product identity comparison by case-insensitive cleaned `Name + Brand`.
- [ ] 3.3 Implement cleaned value and normalized identity functions, including the product identity value shape and missing or `null` brand as an empty identity component.
- [ ] 3.4 Verify domain normalization with `npm test -- --run src/domain`.

## 4. Input Parsing and Validation

- [ ] 4.1 Add tests for unreadable or malformed JSON input failing before import.
- [ ] 4.2 Add tests for parseable input with rejected entries that include identifying context and reasons.
- [ ] 4.3 Add tests for duplicate `SellerName + seller product reference` values inside one input file, including the seller entry idempotency key shape.
- [ ] 4.4 Implement hand-written parsing and validation for seller product entries, including rejected entry output shape.
- [ ] 4.5 Verify input behavior with `npm test -- --run src/input`.

## 5. SQLite Migrations

- [ ] 5.1 Add synthetic SQLite schema fixtures representative of the assessment catalog tables.
- [ ] 5.2 Add SQL migration files for opaque text seller product references and seller link uniqueness protection.
- [ ] 5.3 Implement a migration runner that records applied migrations and skips them on later runs.
- [ ] 5.4 Verify migrations with `npm test -- --run src/db`.

## 6. Import Use Case

- [ ] 6.1 Add integration tests for matching existing catalog products by normalized name and brand.
- [ ] 6.2 Add integration tests for inserting new catalog products with cleaned source values.
- [ ] 6.3 Add integration tests for brandless identity, ambiguous catalog matches, and rejected entries.
- [ ] 6.4 Add integration tests for first-run link creation and repeated-run idempotency.
- [ ] 6.5 Implement the import use case with migrations before import, valid-entry writes inside one transaction, and the import result output shape.
- [ ] 6.6 Verify import behavior with `npm test -- --run src/import`.

## 7. CLI Adapter

- [ ] 7.1 Add CLI smoke tests for required arguments, non-zero failures, and stdout JSON shape.
- [ ] 7.2 Implement argument parsing for `--db` and `--input`.
- [ ] 7.3 Wire the CLI adapter to the import use case and print `productsInserted`, `productsMatched`, `sellerLinksCreated`, `sellerLinksSkipped`, and `entriesRejected`.
- [ ] 7.4 Verify CLI behavior with `npm test -- --run src/cli`.

## 8. Documentation and Final Verification

- [ ] 8.1 Update README usage notes with the import command, expected output shape, and confidentiality guidance for external assessment assets.
- [ ] 8.2 Run the full test suite with `npm test -- --run`.
- [ ] 8.3 Validate the OpenSpec change with `openspec validate add-catalog-import --type change --strict --no-interactive`.
- [ ] 8.4 Confirm readiness with `openspec status --change add-catalog-import`.
