# Catalog Consolidation

TypeScript CLI for importing seller product entries from JSON into an existing SQLite catalog database.

The importer consolidates seller entries into canonical catalog products by normalized `Name + Brand`, creates seller product links for traceability, applies required SQLite migrations before writing, and prints a structured JSON result.

## Prerequisites

- Node.js 22 or newer
- npm
- A SQLite catalog database with the assessment-style tables:
  - `Products (Id, Name, Brand, Category)`
  - `SellerProducts (Id, ProductId, SellerName, SellerProductId)`

Install dependencies:

```bash
npm install
```

## Run Tests

Run the full test suite:

```bash
npm test -- --run
```

Run focused suites while developing:

```bash
npm test -- --run src/domain
npm test -- --run src/input
npm test -- --run src/db
npm test -- --run src/import
npm test -- --run src/cli
```

Type-check the project:

```bash
npm run typecheck
```

## Import Products

Run the import command with explicit database and input paths:

```bash
npm run import -- --db ./path/to/catalog.db --input ./path/to/products.json
```

The command writes to the provided database. Create a backup before running it against an assessment or production-like database.

## Input JSON

The input file must be valid JSON containing an array of seller product entries.

```json
[
  {
    "SellerName": "Camera Seller",
    "SellerProductId": "camera-r6-001",
    "Name": " Camera Canon EOS R6 ",
    "Brand": " Canon ",
    "Category": " Photography "
  }
]
```

Required fields:

- `SellerName`: non-empty string
- `SellerProductId`: non-empty string
- `Name`: non-empty string

Optional fields:

- `Brand`: string or `null`
- `Category`: string or `null`

Missing optional fields are treated as `null`. Invalid entries inside a parseable file are rejected and reported while valid entries continue through the import.

Unreadable files and malformed JSON fail the command before import.

## Output JSON

A completed parseable import prints one JSON object to stdout:

```json
{
  "productsInserted": 1,
  "productsMatched": 1,
  "sellerLinksCreated": 2,
  "sellerLinksSkipped": 0,
  "entriesRejected": [
    {
      "sellerName": "Camera Seller",
      "sellerProductReference": "camera-r6-duplicate",
      "reasons": [
        {
          "field": "SellerProductId",
          "code": "duplicate_seller_entry",
          "message": "SellerName + SellerProductId must be unique within the input file."
        }
      ]
    }
  ]
}
```

Output fields:

- `productsInserted`: new canonical catalog products created
- `productsMatched`: seller entries linked to existing catalog products
- `sellerLinksCreated`: seller product links inserted
- `sellerLinksSkipped`: seller product links already present from a previous run
- `entriesRejected`: invalid, duplicate, or ambiguous seller entries that were not imported

## Import Behavior

- Product identity is normalized by cleaned `Name + Brand`.
- Cleaning trims leading/trailing whitespace and collapses repeated whitespace.
- Matching is case-insensitive, but inserted product values preserve cleaned source casing.
- `Category` is descriptive metadata and is not part of product identity.
- Missing or `null` brand matches only brandless catalog products with the same normalized name.
- Ambiguous matches are rejected instead of choosing a product arbitrarily.
- `SellerName + SellerProductId` is the seller entry idempotency key.
- Re-running the same import skips existing seller links instead of creating duplicates.
- Valid write operations run in a single transaction.
- Migrations run before import and adapt seller product references to text with uniqueness protection.

## Repository Layout

- `src/cli`: command adapter and CLI smoke tests
- `src/import`: import use case and integration tests
- `src/input`: JSON file parsing and validation
- `src/domain`: catalog product identity and normalization
- `src/db`: SQLite adapters, migrations, and database helpers
- `openspec/changes/add-catalog-import`: OpenSpec planning artifacts for this change
- `docs`: design decisions and implementation context

## Confidentiality

Do not commit supplied assessment PDFs, the original SQLite database, or the original seller product import file. Keep those assets outside the repository and pass their local paths with `--db` and `--input`.

Repository tests use synthetic fixtures only.
