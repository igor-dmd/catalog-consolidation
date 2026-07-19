# CLI adapter over import use case

The solution will expose the required catalog consolidation behavior through a TypeScript CLI, while keeping the CLI as a thin adapter over an import use case. The take-home scope includes only the import operation; adjacent operations such as validate-only, dry-run, inspect, rollback, and explain-match are intentionally deferred.

**Consequences**

The command handler should parse arguments, call the import use case, print a structured result, and map expected failures to exit codes. Validation, duplicate detection, transaction handling, and database persistence belong outside the CLI adapter so they can be tested through application-level seams and extended later without rewriting command parsing code.

