# Store cleaned source values for new products

When inserting a new catalog product from a seller product entry, the importer will store `Name`, `Brand`, and `Category` as cleaned source values: trimmed with repeated whitespace collapsed, but without case normalization, translation, or synonym rewriting. Matching normalization is only used to decide identity.

**Consequences**

This preserves readable seller-provided data while removing obvious formatting noise. Future catalog curation could introduce richer canonicalization rules, but that is separate from the current consolidation behavior.

