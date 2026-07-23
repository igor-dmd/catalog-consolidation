# Catalog Consolidation

This context describes the catalog consolidation challenge: importing seller-provided product entries into an existing marketplace catalog without creating duplicate canonical products.

## Language

**Import File**:
The external JSON file supplied to an import command. It is the filesystem artifact read before seller product entries can be parsed or validated.
_Avoid_: Input, payload

**Import Input**:
The decoded seller-provided records from a parseable import file, before valid seller product entries and rejected entries are separated.
_Avoid_: Import file, payload

**Catalog Product**:
A canonical product stored in the marketplace catalog. It represents the marketplace's consolidated view of a product, independent of any one seller.
_Avoid_: Item, listing

**Seller Product Entry**:
A product record received from a seller import file. It includes seller ownership data plus descriptive product data that may vary from the canonical catalog product.
_Avoid_: Product, item

**Seller Product Link**:
The association showing that a seller offers a specific catalog product. It preserves the seller's product identifier from the import file.
_Avoid_: Duplicate, seller item

**Seller Product Reference**:
The external identifier received for a seller product entry. It is stored as text because different import sources may use different identifier formats.
_Avoid_: Numeric seller product ID, internal product ID

**Duplicate Product**:
A seller product entry that represents an existing catalog product and therefore should not create a new catalog product row. This is about catalog consolidation, not repeated seller input.
_Avoid_: Similar product, repeated seller entry

**Cleaned Value**:
Source text after trimming leading and trailing whitespace and collapsing repeated internal whitespace, while preserving the source casing.
_Avoid_: Normalized value, sanitized value

**Product Identity**:
The normalized name, brand, and category used to decide whether a seller product entry refers to an existing catalog product. It is compared case-insensitively and is distinct from the cleaned values stored on new catalog products.
_Avoid_: Seller product reference, seller entry idempotency key

**Idempotent Import**:
An import that can be run repeatedly with the same seller product entries without creating additional catalog products or seller product links after the first successful run.
_Avoid_: Retry-safe import, duplicate-safe run

**Rejected Entry**:
A seller product entry that is not consolidated because it lacks required data or fails validation. Every rejected entry must be reported with enough context to identify what was left out and why.
_Avoid_: Invalid row, bad record

**Duplicate Seller Entry**:
A repeated seller-owned entry in the same import input, identified by the same seller name and seller product reference.
_Avoid_: Ambiguous match, duplicate catalog product

**Seller Entry Idempotency Key**:
The combination of seller name and seller product reference that identifies whether a seller product entry was already linked.
_Avoid_: Product identity, catalog key

**Ambiguous Catalog Match**:
A seller product entry whose product identity matches multiple existing catalog products, making the canonical product unsafe to choose automatically. This is about conflicting catalog candidates, not repeated seller input.
_Avoid_: Duplicate seller entry, fuzzy match
