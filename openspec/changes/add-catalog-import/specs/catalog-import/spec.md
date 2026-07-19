## ADDED Requirements

### Requirement: Catalog import data model
The system SHALL model seller input, canonical catalog products, seller product links, rejected entries, and import results as distinct concepts.

#### Scenario: Seller product entry matches a catalog product
- **WHEN** a seller product entry matches an existing catalog product
- **THEN** the system preserves the canonical catalog product and creates or skips a seller product link instead of treating the seller product entry as a new catalog product

#### Scenario: Seller product link preserves traceability
- **WHEN** a seller product link is created
- **THEN** the system stores the seller name and opaque seller product reference associated with the linked catalog product

#### Scenario: Import result hides database internals
- **WHEN** the CLI prints the import result
- **THEN** the result reports model-level outcomes and rejected entry reasons without exposing raw SQL rows or migration internals

### Requirement: CLI import command
The system SHALL expose a TypeScript CLI import operation runnable as `npm run import -- --db <catalog-db> --input <products-json>`.

#### Scenario: Successful command invocation
- **WHEN** the user runs the import command with readable `--db` and `--input` paths
- **THEN** the system runs migrations, imports the input, writes changes by default, and prints a structured JSON result to stdout

#### Scenario: Missing required arguments
- **WHEN** the user runs the import command without `--db` or without `--input`
- **THEN** the system exits with a non-zero status and reports the missing argument without attempting database writes

### Requirement: Input parsing and validation
The system SHALL read seller product entries from JSON and distinguish unreadable or malformed files from invalid entries inside a parseable file.

#### Scenario: Malformed input file
- **WHEN** the input path cannot be read or its contents are not valid JSON
- **THEN** the system exits with a non-zero status and does not import any entries

#### Scenario: Invalid entries in a parseable file
- **WHEN** a parseable JSON file contains seller product entries missing required data or containing invalid values
- **THEN** the system rejects those entries, includes identifying context and reasons in `entriesRejected`, and continues processing valid entries

#### Scenario: Duplicate seller references in input
- **WHEN** the same `SellerName + seller product reference` appears more than once in a single input file
- **THEN** the system rejects the duplicate seller product entries and reports the duplicate idempotency key

### Requirement: Product identity normalization
The system SHALL normalize catalog product identity using cleaned `Name + Brand`.

#### Scenario: Matching by normalized name and brand
- **WHEN** a seller product entry has a name and brand that match an existing catalog product after trimming, whitespace collapse, and case-insensitive comparison
- **THEN** the system links the seller product entry to the existing catalog product instead of inserting a new catalog product

#### Scenario: Brandless product identity
- **WHEN** a seller product entry has a missing or `null` brand
- **THEN** the system treats the normalized brand as an empty identity component and does not match a branded catalog product by name alone

#### Scenario: New catalog product insertion
- **WHEN** a valid seller product entry does not match any existing catalog product by normalized name and brand
- **THEN** the system inserts a new catalog product using cleaned source values without case normalization, translation, or synonym rewriting

#### Scenario: Ambiguous catalog match
- **WHEN** a seller product entry matches multiple existing catalog products by normalized name and brand
- **THEN** the system rejects the entry as ambiguous and does not create a seller product link for it

### Requirement: SQLite migrations
The system SHALL apply explicit SQLite migrations before importing seller product entries.

#### Scenario: Seller product reference storage is migrated
- **WHEN** the import command runs against a database that has not yet received the import migrations
- **THEN** the system applies migrations that allow opaque text seller product references and uniqueness protection for seller links

#### Scenario: Migration idempotency
- **WHEN** the import command runs more than once against the same database
- **THEN** the system skips already applied migrations and proceeds without duplicating migration effects

### Requirement: Transactional idempotent import
The system SHALL import valid seller product entries transactionally and idempotently.

#### Scenario: First import creates products and links
- **WHEN** valid seller product entries are imported for the first time
- **THEN** the system creates only missing catalog products and seller product links and reports created and matched counts

#### Scenario: Repeated import skips existing seller links
- **WHEN** the same seller product entries are imported again
- **THEN** the system does not create additional catalog products or seller product links and reports skipped seller links

#### Scenario: Unexpected write failure
- **WHEN** an unexpected database write failure occurs during the valid-entry write phase
- **THEN** the system rolls back the transaction and exits with a non-zero status

### Requirement: Structured import result
The system SHALL print a structured JSON result for completed parseable imports.

#### Scenario: Result fields
- **WHEN** an import completes for a parseable input file
- **THEN** the JSON result includes `productsInserted`, `productsMatched`, `sellerLinksCreated`, `sellerLinksSkipped`, and `entriesRejected`

#### Scenario: Rejected entry context
- **WHEN** entries are rejected during validation or matching
- **THEN** each rejected entry includes enough context to identify the source seller product entry and the reason it was not imported
