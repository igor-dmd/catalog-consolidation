## Context

The existing import implementation consolidates seller product entries by normalized `Name + Brand`. `Category` is already present in seller input, catalog product rows, validation, insertion, and output examples, but current domain identity ignores it. The durable decision record currently says category is descriptive metadata only, so this change intentionally supersedes that decision.

## Goals / Non-Goals

**Goals:**

- Make normalized category a primary product identity component alongside normalized name and brand.
- Preserve the existing normalization style: trim, collapse repeated whitespace, and compare case-insensitively.
- Keep missing or `null` category behavior explicit by normalizing it to an empty identity component.
- Keep the matching behavior in the domain classification seam and let the import use case consume that classification.
- Update docs and OpenSpec tasks so future implementation proceeds as vertical TDD slices.

**Non-Goals:**

- Category synonym handling, hierarchy traversal, fuzzy matching, or translation such as `Photo` matching `Photography`.
- Updating existing catalog product metadata from seller entries.
- Adding database schema changes, normalized columns, or expression indexes.
- Adding explain-match, dry-run, validate-only, rollback, or inspect modes.

## Decisions

1. Treat `Category` as part of `ProductIdentity`.

   `ProductIdentity` will add a normalized category component. This keeps identity as one domain concept instead of introducing a separate post-match conflict resolver. It also makes the new rule apply consistently to existing catalog matches, in-transaction matches after inserts, and ambiguous-match detection.

   Alternative considered: use category only to break ties after multiple `Name + Brand` matches. That does not satisfy the updated requirement because products with different categories would still share a primary identity until conflict time.

2. Normalize category with the same text rule as name and brand.

   Category comparison will trim, collapse whitespace, and lowercase. Missing or `null` category will normalize to an empty component, matching the existing brandless identity pattern.

   Alternative considered: preserve exact category spelling in identity. That would make harmless whitespace or case differences create new catalog products, conflicting with the established normalization behavior.

3. Keep persistence unchanged.

   New catalog products already store cleaned source category, and existing catalog products are already loaded with category. The database schema does not need a migration for this behavior change.

   Alternative considered: add persisted normalized identity columns now. That remains unnecessary at the project scale and would expand the migration surface without changing user-visible behavior.

## Risks / Trade-offs

- `Photo` and `Photography` will no longer consolidate automatically -> This is intentional under the new primary identity rule and remains documented as outside synonym handling.
- Existing data may contain duplicate catalog products with identical normalized name, brand, and category -> The importer will continue rejecting those entries as ambiguous rather than choosing a canonical product.
- Category quality now affects product creation more strongly -> Validation already allows string or `null`; higher-quality category governance remains outside this import use case.

## Migration Plan

1. Update the domain identity tests and implementation.
2. Update import integration behavior that previously expected category differences to match.
3. Update ambiguous-match expectations to require duplicate candidates across all three identity components.
4. Update README, domain language, and durable decisions.
5. Run targeted domain/import/CLI checks and the full test suite.

Rollback is a code/configuration rollback only; no database migration is introduced.

## Open Questions

- None. The user clarified that category must be a primary identity criterion together with name and brand.
