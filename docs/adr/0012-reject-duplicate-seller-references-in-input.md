# Reject duplicate seller references in input

Within a single input file, `SellerName` plus seller product reference is the idempotency key for a seller product entry. If the same key appears more than once in the file, later entries will be rejected and reported instead of silently choosing one.

**Consequences**

This makes inconsistent input visible to the operator and avoids guessing which seller product entry is authoritative. Existing seller links in the database with the same key are skipped as already imported, but conflicting duplicates inside the same file are treated as input quality problems.

