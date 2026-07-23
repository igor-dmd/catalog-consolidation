## 1. Domain Product Identity

- [x] 1.1 Public seam: `classifyCatalogMatch`. Add a focused domain test showing that a seller entry matches an existing catalog product only when normalized name, brand, and category all match; implement the category identity component; verify with `npm test -- --run src/domain`.
- [x] 1.2 Public seam: `classifyCatalogMatch`. Add a focused domain test showing that missing or `null` category normalizes to an empty identity component and does not match a categorized catalog product by name and brand alone; implement only any remaining domain behavior needed; verify with `npm test -- --run src/domain`.
- [x] 1.3 Public seam: `classifyCatalogMatch`. Update the ambiguous-match domain test so ambiguity requires multiple catalog products with matching normalized name, brand, and category; verify with `npm test -- --run src/domain`.

## 2. Import Use Case

- [x] 2.1 Public seam: `importCatalogProducts`. Add an integration test showing that a seller entry with matching name and brand but different category inserts a new catalog product and seller link; implement the use-case behavior through the updated domain classification; verify with `npm test -- --run src/import`.
- [x] 2.2 Public seam: `importCatalogProducts`. Add an integration test showing that a seller entry matches an existing catalog product when normalized name, brand, and category all match, including category case and whitespace normalization; implement only any remaining import behavior needed; verify with `npm test -- --run src/import`.
- [x] 2.3 Public seam: `importCatalogProducts`. Update ambiguous import coverage so ambiguous rejection occurs only when multiple existing catalog products match all three identity components; verify with `npm test -- --run src/import`.

## 3. CLI And Documentation

- [ ] 3.1 Public seam: CLI import command. Update thin CLI smoke coverage or existing expectations that describe product matching so the command behavior reflects `Name + Brand + Category`; verify with `npm test -- --run src/cli`.
- [ ] 3.2 Update README usage notes and `CONTEXT.md` domain language to document category as a primary identity criterion, plus the no-synonym/no-hierarchy non-goals; verify references with `rg -n "Name \\+ Brand|Category.*descriptive|product identity|identity" README.md CONTEXT.md docs openspec/changes/use-category-in-product-identity`.
- [ ] 3.3 Run full verification with `npm test -- --run` and `openspec validate use-category-in-product-identity --type change --strict --no-interactive`.
