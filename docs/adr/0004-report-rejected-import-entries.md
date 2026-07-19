# Report rejected import entries

The importer will fail the run for unreadable or malformed input files, but it will reject individual seller product entries when a parseable file contains entries that fail validation. Each rejected entry must include a reason and identifying context in the import result so the operator knows exactly what was left out.

**Consequences**

`Id`, `SellerName`, and `Name` are required for consolidation because they are needed to create a traceable seller product link and product identity. `Brand` and `Category` may be absent or `null` because the supplied data already includes null brands, and the consolidation rule treats brand as an opaque identity component that can be empty.

