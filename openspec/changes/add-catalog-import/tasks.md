## 1. Project Scaffold and Tooling

- [ ] 1.1 Add Node.js/TypeScript project files, `npm run import`, `npm test`, and any needed scripts for Vitest and `tsx`.
- [ ] 1.2 Add documented dependencies: TypeScript, Vitest, `tsx`, `better-sqlite3`, and matching TypeScript types where needed.
- [ ] 1.3 Create the initial source and test directory structure for CLI, domain, application, database, migrations, and synthetic fixtures.
- [ ] 1.4 Verify scaffold with `npm test -- --run`.

## 2. Domain Normalization

- [ ] 2.1 Add tests for cleaning values by trimming and collapsing whitespace while preserving source casing.
- [ ] 2.2 Add tests for normalized product identity comparison by case-insensitive cleaned `Name + Brand`.
- [ ] 2.3 Implement cleaned value and normalized identity functions, including missing or `null` brand as an empty identity component.
- [ ] 2.4 Verify domain normalization with `npm test -- --run src/domain`.

## 3. Input Parsing and Validation

- [ ] 3.1 Add tests for unreadable or malformed JSON input failing before import.
- [ ] 3.2 Add tests for parseable input with rejected entries that include identifying context and reasons.
- [ ] 3.3 Add tests for duplicate `SellerName + seller product reference` values inside one input file.
- [ ] 3.4 Implement hand-written parsing and validation for seller product entries.
- [ ] 3.5 Verify input behavior with `npm test -- --run src/input`.

## 4. SQLite Migrations

- [ ] 4.1 Add synthetic SQLite schema fixtures representative of the assessment catalog tables.
- [ ] 4.2 Add SQL migration files for opaque text seller product references and seller link uniqueness protection.
- [ ] 4.3 Implement a migration runner that records applied migrations and skips them on later runs.
- [ ] 4.4 Verify migrations with `npm test -- --run src/db`.

## 5. Import Use Case

- [ ] 5.1 Add integration tests for matching existing catalog products by normalized name and brand.
- [ ] 5.2 Add integration tests for inserting new catalog products with cleaned source values.
- [ ] 5.3 Add integration tests for brandless identity, ambiguous catalog matches, and rejected entries.
- [ ] 5.4 Add integration tests for first-run link creation and repeated-run idempotency.
- [ ] 5.5 Implement the import use case with migrations before import and valid-entry writes inside one transaction.
- [ ] 5.6 Verify import behavior with `npm test -- --run src/import`.

## 6. CLI Adapter

- [ ] 6.1 Add CLI smoke tests for required arguments, non-zero failures, and stdout JSON shape.
- [ ] 6.2 Implement argument parsing for `--db` and `--input`.
- [ ] 6.3 Wire the CLI adapter to the import use case and print `productsInserted`, `productsMatched`, `sellerLinksCreated`, `sellerLinksSkipped`, and `entriesRejected`.
- [ ] 6.4 Verify CLI behavior with `npm test -- --run src/cli`.

## 7. Documentation and Final Verification

- [ ] 7.1 Update README usage notes with the import command, expected output shape, and confidentiality guidance for external assessment assets.
- [ ] 7.2 Run the full test suite with `npm test -- --run`.
- [ ] 7.3 Validate the OpenSpec change with `openspec validate add-catalog-import --type change --strict --no-interactive`.
- [ ] 7.4 Confirm readiness with `openspec status --change add-catalog-import`.
