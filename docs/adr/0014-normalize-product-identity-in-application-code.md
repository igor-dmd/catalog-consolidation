# Normalize product identity in application code

The importer will compute normalized product identity in TypeScript instead of adding normalized identity columns to `Product`. The current catalog size is small enough for an application-level scan, and this keeps the take-home solution easier to explain and test without backfilling derived database columns.

**Consequences**

Matching by normalized `Name + Brand` is less efficient than an indexed database lookup, but it avoids additional schema complexity for the supplied dataset. A future production version should consider persisted normalized identity columns or expression indexes so duplicate detection can be enforced and queried efficiently in SQLite.

