# Do not update matched catalog products

When a seller product entry matches an existing catalog product, the importer will not update the existing `Product` row. It will only create or skip the seller product link.

**Consequences**

Seller-provided metadata such as category, spelling, casing, or translated terms cannot overwrite the marketplace's existing canonical product data during consolidation. Catalog enrichment and curation are separate workflows and are outside the take-home scope.

