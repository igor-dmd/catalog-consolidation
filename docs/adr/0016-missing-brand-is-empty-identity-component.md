# Missing brand is an empty identity component

For product identity, a missing or `null` brand is normalized to an empty string and still participates in the `Name + Brand` identity key. A brandless seller product entry only matches a brandless catalog product with the same normalized name; it does not match branded products by name alone.

**Consequences**

This conservative rule can create duplicate catalog products when a seller omits a brand that exists in the catalog. That trade-off is preferable for this exercise because matching by name alone risks linking sellers to the wrong product, while rejecting null-brand entries would be stricter than the supplied schema and input data imply.

