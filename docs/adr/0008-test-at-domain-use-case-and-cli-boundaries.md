# Test at domain, use-case, and CLI boundaries

Tests will be written at public behavior boundaries: pure domain functions, the import use case with a temporary SQLite database, and a small CLI smoke layer. Pure unit tests should cover happy paths as well as edge cases so normal behavior is specified before implementation details exist.

**Consequences**

The main integration seam is the import use case running against a real temporary SQLite database and fixture input files. CLI tests should stay thin and verify argument parsing, exit code, and output shape. Tests should avoid private repository methods or SQL internals unless a discovered bug requires a narrower regression test.

