# Apply valid import entries atomically

The importer will validate parseable input first, then apply all valid seller product entries inside a single database transaction. Validation rejections are reported without blocking valid entries, but unexpected database write failures roll back the entire write phase.

**Consequences**

An import result has a clear boundary: rejected entries were deliberately left out before commit, while accepted entries are either fully persisted or not persisted at all. This keeps retry behavior predictable and avoids partial database writes caused by runtime failures.

