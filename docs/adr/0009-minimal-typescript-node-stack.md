# Minimal TypeScript Node stack

The project will use Node.js with TypeScript, Vitest for tests, `tsx` for development execution, `better-sqlite3` for SQLite access, and `node:util.parseArgs` or equivalent small argument parsing for the CLI. We will not introduce a validation library such as Zod initially; validation will be hand-written for the small input schema.

**Consequences**

This keeps the implementation small and easy to explain in the 48-hour assessment scope. If validation grows beyond the current fields or error reporting becomes hard to maintain, adding a schema validation library later remains straightforward.

