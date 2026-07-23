## Why

Product consolidation currently treats `Category` as descriptive metadata, which can collapse seller product entries that share `Name + Brand` but should remain distinct by category. The import should use category as a primary identity component alongside name and brand so catalog matching reflects the updated conflict-resolution rule.

## What Changes

- Change product identity matching from normalized `Name + Brand` to normalized `Name + Brand + Category`.
- Treat missing or `null` category as an empty identity component, so categoryless entries only match categoryless catalog products with the same normalized name and brand.
- Insert a new catalog product when name and brand match but category differs.
- Reject ambiguous catalog matches only when multiple existing catalog products match all identity components.
- Update durable project decisions to supersede the earlier decision that category was descriptive metadata only.
- Non-goals: fuzzy matching, category synonym translation, category hierarchy handling, seller-driven updates to existing catalog product metadata, persisted normalized identity columns, and explain-match output.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `catalog-import`: Product identity and catalog match requirements now include category as a primary identity component.

## Impact

- Domain normalization and catalog match classification will include normalized category.
- Import use case behavior changes for matching, insertion, and ambiguity detection.
- Existing domain, import, CLI, README, and domain-language expectations that mention `Name + Brand` matching need revision to `Name + Brand + Category`.
- No database schema change is expected because `Product.Category` already exists and seller entries already parse category.
