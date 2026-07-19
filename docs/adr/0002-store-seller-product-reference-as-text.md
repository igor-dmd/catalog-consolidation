# Store seller product reference as text

The supplied `SellerProduct.SellerProductId` column is an integer, but the import file provides UUID strings as seller product entry identifiers. We will store this value as an opaque text seller product reference so the link table can preserve traceability to the source entry without inventing lossy numeric mappings.

**Considered Options**

- Keep `SellerProductId` as `INTEGER`: avoids changing the supplied schema, but cannot faithfully store the provided UUID values.
- Change `SellerProductId` to `TEXT`: stores the current input IDs directly and still allows numeric IDs as strings from future inputs.
- Store the whole source entry as metadata: maximizes flexibility, but adds unnecessary scope and weakens simple querying for this exercise.

**Consequences**

This decision assumes one opaque external reference per seller product entry. Future import sources with composite identifiers may require an additional source-system field or a richer ingestion metadata model, but that is outside the current consolidation scope.

